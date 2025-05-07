# AlgoDraft

AlgoDraft is an innovative platform designed to help users bridge the gap between algorithmic thinking and coding. By allowing users to create **flowcharts that automatically generate source code**, AlgoDraft shifts the focus from memorizing syntax to mastering logical problem-solving. 

# Development Environment Setup

* Install Next.js by following the instructions at https://nextjs.org/docs/app/getting-started/installation
* Setup a virtual environment in python
    * Open the terminal in VS Code
    * Navigate to the folder 'Chartify' (note: ***not*** 'chartify')
    * Run the following commands
    ```
    python -m venv venv
    source venv/bin/activate
    ```
    * Then, install the dependencies
    ```
    npm install
    ```
    * Then, start the server
    ```
    npm run dev
    ```

Open http://localhost:3000 in any browser to see the webpage

Open http://127.0.0.1:8000/api/py/helloFastApi to see the results from FastAPI from index.py
