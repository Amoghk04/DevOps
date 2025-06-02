## EscapeVerse - Virtual Escape Room

There are multiple ways to run this application be it locally or on a hosted environment. We will look through it one by one

Via Git Clone

- Clone the repository from https://www.github.com/Amoghk04/DevOps using the command `git clone https://www.github.com/Amoghk04/DevOps`
- Go into the escapeverse directory and run the command `npm run dev`.
- Next go to the escapeverse/server directory and run `npm run dev:all` .
- The application will be running on http://localhost:5173.

Via Docker images

- Run these commands on 2 different terminals  `docker run amoghk04/ev-client:v2` and `docker run amoghk04/ev-server:v1`.
- The application will start running on http://localhost:5173

Via Kubernetes Cluster (minikube)

- Make sure to install docker desktop, kubectl and minikube on your local machine before trying this
- Run `minikube start –driver=docker` to start minikube
- Go into the escapeverse/k8s directory and run the command `kubectl apply -f /*` 
- This will create 2 pods, 2 services and an ingress service to accept the requests from the user
- Run `kubectl get pods` to confirm the pods are running, now you can access the application at http://localhost:5173

Via GCP (Currently hosted platform)

- Create a free tier GCP account on the google cloud console.
- Create a VM instance either using the console or the GUI.
- Follow the steps to create the k8s cluster and run it with ingress-nginx
- This will give an external IP on which we can access our application.

