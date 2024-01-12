# AsyncAgents - Flask Server

This is the frontend visualizer for Async Agents created using [React](https://react.dev/), [Material UI](https://mui.com/), and [react-force-graph](https://github.com/vasturiano/react-force-graph). This visualizer comprises of a 3D interactive experience and viewer of interactions between asynchronous agents and users based on [graph theory](https://en.wikipedia.org/wiki/Graph_theory). Nodes represent individual agents and edges represent available communication pathways.

[Insert Image/GIF here]


# Requirements and Installation
These are the versions of software I used when developing this, but does not mean that it won't work on other versions.

I personally used node v18.15.0 nvm 1.1.11 and npm 9.1.3.

1. Install the required packages

   ```sh
   npm install
   ```

2. Create .env file (or .env.development.local) and place the following in the file:

   ```sh
   REACT_APP_API_URL=http://localhost:5000
   ```

3. Start the development server

   ```sh
   npm start
   ```
