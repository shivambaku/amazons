Project:

My project is what was assigned but instead of only using scope based function, the ai uses
monte carlo tree search. At first my plan was to only use monte carlo tree search with simulation
policy to be picking random moves, which works well for very large iterations. But I decided to
incorporate scope function as a heurestic for monte carlo tree search.

If needed I can use only scope based and the project is the same as the default project. However,
not done in C++.

How to run:

The application is made using javascript, reactjs, and d3.

To run on the pc the user needs nodejs. It can be downloaded online.

Once node is installed, run the following commands in the Amazons/ folder

npm install
npm start

npm install is needed only once to install all node modules required by this application.
npm start will run a local server and start the application.

I can try to host it online privately if that is prefered instead.

Extra credits:

Optimal play is up to height 5. I am using alpha-beta pruning algorithm with defined height of 5.
The ai returns the optimal solution if it finds in under that height, otherwise returns null.
If alpha-beta pruning returns null then I go on with monte carlo tree search.
Also alpha-beta pruning is a breadth-first search that checks every posibilities, so it is
gauranteed to find the solution.

Number of sum of games is shown in a text form, each time the games splits into more games,
the number increments.

The game has a UI.

