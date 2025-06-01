import { useEffect, useState, useRef } from 'react';

const InteractiveImageMap = ({ 
  imageSrc, 
  areas = [],
  fullscreenOnMount = false,
  className = "w-screen h-screen relative overflow-hidden",
  containerClassName = "w-screen h-screen fixed top-0 left-0",
  hoverBorderColor = "rgba(255, 204, 0, 0.8)",
  hoverBorderWidth = "3px",
}) => {
  const [, setIsFullscreen] = useState(false);
  const [hoveringAreaId, setHoveringAreaId] = useState(null);
  const [imageNaturalDimensions, setImageNaturalDimensions] = useState({ width: 0, height: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [scaledAreas, setScaledAreas] = useState([]);

  // Calculate image's natural aspect ratio once loaded
  useEffect(() => {
    const loadImage = new Image();
    loadImage.onload = () => {
      setImageNaturalDimensions({
        width: loadImage.naturalWidth,
        height: loadImage.naturalHeight
      });
      setImgLoaded(true);
    };
    loadImage.src = imageSrc;
  }, [imageSrc]);

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
      if (imageRef.current && areas.length > 0 && imgLoaded) {
        // Get the natural dimensions of the image
        const naturalWidth = imageNaturalDimensions.width;
        const naturalHeight = imageNaturalDimensions.height;
        
        // Get the container dimensions (viewport size)
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        
        // Calculate the dimensions of the image as displayed with object-cover
        let displayedWidth, displayedHeight;
        
        // Calculate what the image dimensions would be if scaled to fill the container
        // while maintaining aspect ratio
        const containerRatio = containerWidth / containerHeight;
        const imageRatio = naturalWidth / naturalHeight;
        
        if (containerRatio > imageRatio) {
          // Container is wider than the image aspect ratio - image will be stretched horizontally
          displayedWidth = containerWidth;
          displayedHeight = containerWidth / imageRatio;
        } else {
          // Container is taller than the image aspect ratio - image will be stretched vertically
          displayedHeight = containerHeight;
          displayedWidth = containerHeight * imageRatio;
        }
        
        // Calculate offsets to center the image
        const offsetLeft = (containerWidth - displayedWidth) / 2;
        const offsetTop = (containerHeight - displayedHeight) / 2;
        
        // Calculate scaling factors
        const scaleX = displayedWidth / naturalWidth;
        const scaleY = displayedHeight / naturalHeight;
        
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
          const points = [];
          for (let i = 0; i < coords.length; i += 2) {
            if (i + 1 < coords.length) {
              const x = coords[i] * scaleX + offsetLeft;
              const y = coords[i+1] * scaleY + offsetTop;
              points.push(x, y);
            }
          }
          
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
            points,
            svgPoints: svgPoints.join(' ')
          };
        });
        
        setScaledAreas(newScaledAreas);
      }
    };

    // Calculate initially and on window resize
    if (imgLoaded) {
      // Also calculate on window resize
      window.addEventListener('resize', calculateAreas);
      
      // Initial calculation
      calculateAreas();
    }
    
    return () => {
      window.removeEventListener('resize', calculateAreas);
    };
  }, [areas, imgLoaded, imageNaturalDimensions]);

  // Check if a point is inside a polygon
  const isPointInPolygon = (x, y, polygon) => {
    if (!polygon || polygon.length < 6) return false; // Need at least 3 points (6 values)
    
    let inside = false;
    
    for (let i = 0, j = polygon.length - 2; i < polygon.length; j = i, i += 2) {
      const xi = polygon[i], yi = polygon[i + 1];
      const xj = polygon[j], yj = polygon[j + 1];
      
      const intersect = ((yi > y) !== (yj > y)) && 
                        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    
    return inside;
  };

  // Handle mouse movement over the container
  const handleMouseMove = (e) => {
    if (scaledAreas.length === 0 || !containerRef.current) return;

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
  
  // Determine aspect ratio style
  const getAspectRatioStyle = () => {
    return {}; // No explicit aspect ratio - we'll handle it with object-cover
  };
  
  return (
    <div 
      className={containerClassName}
      ref={containerRef}
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
      {/* Main background image with aspect ratio container */}
      <div 
        className={className}
        style={getAspectRatioStyle()}
      >
        <img 
          ref={imageRef}
          src={imageSrc} 
          className="w-full h-full object-cover"
          alt="Interactive map"
          style={{ pointerEvents: 'none' }} // Disable image map behavior
          onLoad={() => {
            if (imageRef.current) {
              setImageNaturalDimensions({
                width: imageRef.current.naturalWidth,
                height: imageRef.current.naturalHeight
              });
              setImgLoaded(true);
            }
          }}
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
      </div>
      
      
    </div>
  );
};

export default InteractiveImageMap;