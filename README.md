#nb2cdb
node.js ETL script for nationbuilder and cartoDB

##Overview
`script.js` pulls data from the nationbuilder API and pushes it to a CartoDB table using the SQL API.

##How to Use
- clone this repo 
- install dependencies `npm install`
- create a `config.js` file based on `config.sample.js`
- create an empty table in cartodb with the name you specified in `config.js`, make sure all of your `people` keys in `transform()` correspond to the columns in the table
- Run the script `node script.js`

If all goes well, you will see all of your data in the CartoDB table with valid point geometries!

###TODO
- Pagination