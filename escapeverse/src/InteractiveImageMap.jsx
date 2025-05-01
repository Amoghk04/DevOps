import { useEffect, useState, useRef } from 'react';

const InteractiveImageMap = ({ 
  imageSrc, 
  areas = [],
  fullscreenOnMount = false,
  showDebug = false,
  className = "w-screen h-screen relative overflow-hidden",
  hoverBorderColor = "rgba(255, 204, 0, 0.8)",
  hoverBorderWidth = "3px"
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveringAreaId, setHoveringAreaId] = useState(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [scaledAreas, setScaledAreas] = useState([]);

  useEffect(() => {
    // Function to request fullscreen
    const goFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari, Opera */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
    };

    // Listen for fullscreen change events
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Only trigger fullscreen if option is enabled
    if (fullscreenOnMount) {
      goFullscreen();
    }
    
    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [fullscreenOnMount]);

  // Calculate areas positions when image loads or resizes
  useEffect(() => {
    const calculateAreas = () => {
      if (imageRef.current && areas.length > 0) {
        // Get the natural dimensions of the image
        const naturalWidth = imageRef.current.naturalWidth;
        const naturalHeight = imageRef.current.naturalHeight;
        
        // Get the displayed dimensions of the image
        const displayedWidth = imageRef.current.offsetWidth;
        const displayedHeight = imageRef.current.offsetHeight;
        
        // Calculate the scale factors
        const scaleX = displayedWidth / naturalWidth;
        const scaleY = displayedHeight / naturalHeight;
        
        // Apply offset corrections
        const offsetLeft = imageRef.current.offsetLeft;
        const offsetTop = imageRef.current.offsetTop;

        // Calculate scaled areas
        const newScaledAreas = areas.map(area => {
          const coords = area.coords.split(',').map(Number);
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          
          // Find bounding box
          for (let i = 0; i < coords.length; i += 2) {
            const x = coords[i];
            const y = coords[i + 1];
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
          
          // Calculate scaled values
          const scaledLeft = minX * scaleX + offsetLeft;
          const scaledTop = minY * scaleY + offsetTop;
          const scaledWidth = (maxX - minX) * scaleX;
          const scaledHeight = (maxY - minY) * scaleY;
          
          // Create points array for polygon detection
          const points = coords.map((coord, i) => {
            if (i % 2 === 0) { // x coordinate
              return coord * scaleX + offsetLeft;
            } else { // y coordinate
              return coord * scaleY + offsetTop;
            }
          });
          
          // Create polygon points string for SVG
          const svgPoints = [];
          for (let i = 0; i < coords.length; i += 2) {
            if (i + 1 < coords.length) {
              const x = coords[i] * scaleX + offsetLeft;
              const y = coords[i+1] * scaleY + offsetTop;
              svgPoints.push(`${x},${y}`);
            }
          }

          return {
            ...area,
            position: {
              left: scaledLeft,
              top: scaledTop,
              width: scaledWidth,
              height: scaledHeight
            },
            points: points,
            svgPoints: svgPoints.join(' ')
          };
        });
        
        setScaledAreas(newScaledAreas);
      }
    };

    // Calculate initially and on window resize
    if (imageRef.current) {
      imageRef.current.onload = calculateAreas;
      
      // Also calculate on window resize
      window.addEventListener('resize', calculateAreas);
      
      // Initial calculation
      calculateAreas();
    }
    
    return () => {
      window.removeEventListener('resize', calculateAreas);
    };
  }, [areas, imageSrc]);

  // Check if a point is inside a polygon
  const isPointInPolygon = (x, y, polygon) => {
    if (!polygon) return false;
    
    let inside = false;
    const points = polygon;
    
    for (let i = 0, j = points.length - 2; i < points.length; j = i, i += 2) {
      const xi = points[i], yi = points[i + 1];
      const xj = points[j], yj = points[j + 1];
      
      const intersect = ((yi > y) !== (yj > y)) && 
                        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  };

  // Handle mouse movement over the container
  const handleMouseMove = (e) => {
    if (scaledAreas.length === 0) return;

    // Get mouse position relative to the container
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if mouse is over any area
    let hovering = null;
    for (const area of scaledAreas) {
      if (isPointInPolygon(x, y, area.points)) {
        hovering = area.id;
        break;
      }
    }
    
    setHoveringAreaId(hovering);
  };

  const handleAreaClick = (e, areaId) => {
    e.preventDefault();
    
    // Find the clicked area
    const clickedArea = scaledAreas.find(area => area.id === areaId);
    
    // Execute the onClick handler if provided
    if (clickedArea && clickedArea.onClick) {
      clickedArea.onClick(clickedArea);
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className={className}
      onMouseMove={handleMouseMove}
      onClick={(e) => {
        if (!hoveringAreaId) return;
        
        // Get mouse position relative to container
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if click is inside any area
        for (const area of scaledAreas) {
          if (isPointInPolygon(x, y, area.points)) {
            handleAreaClick(e, area.id);
            break;
          }
        }
      }}
    >
      {/* Main background image */}
      <img 
        ref={imageRef}
        src={imageSrc} 
        className="w-full h-full object-cover"
        alt="Interactive map"
        style={{ pointerEvents: 'none' }} // Disable image map behavior
      />
      
      {/* SVG overlay for hover effects */}
      <svg 
        className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        style={{ overflow: 'visible' }}
      >
        {scaledAreas.map(area => {
          const isHovering = area.id === hoveringAreaId;
          return (
            <polygon 
              key={area.id}
              points={area.svgPoints}
              fill="transparent"
              stroke={isHovering ? hoverBorderColor : 'transparent'}
              strokeWidth={hoverBorderWidth}
              strokeLinejoin="round"
              style={{
                transition: 'stroke 0.2s ease'
              }}
            />
          );
        })}
      </svg>
      
      {/* Status indicator for debugging */}
      {showDebug && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white p-2 rounded text-sm">
          {isFullscreen ? 'Fullscreen Mode' : 'Normal Mode'}
          <br />
          {hoveringAreaId ? `Hovering: ${hoveringAreaId}` : 'Not hovering'}
          <br />
          Areas: {scaledAreas.length}
        </div>
      )}
    </div>
  );
};

export default InteractiveImageMap;