# MobilityDB-OpenLayers
This projects contains the code of a spatiotemporal data visualization using a MobilityDB database in combination with the OpenLayers library.

This work is the result of the research for the master thesis *Visualization of Mobility Data on OpenLayers* that can be found [here](Visualization%20of%20Mobility%20Data%20on%20OpenLayers.pdf).

# Requirements
- npm version 6.14.13
- MobilityDB 1.1

# Datasets used
Two different datasets have been used in this project:
1. Danish AIS data imported into MobilityDB as described in the [workshop](https://www.mobilitydb.com/tutorials.html)
2. Static GTFS data of New York as described in the [work](https://github.com/MobilityDB/MobilityDB-PublicTransport/tree/master) of Ilias El Achouchi

More details are described in the [thesis](Visualization%20of%20Mobility%20Data%20on%20OpenLayers.pdf)

# API endpoints
Once the data has been imported into the MobilityDB database, a table `Ships` is created for the Danish AIS and a table 
`trips_mdb` for New York's GTFS both containing an identifier combined with a `tgeompoint`. The API executes SQL queries into these tables to access the information.

Here is a list of all the endpoints created by the API:

| Endpoint                      | Description |
| -----------                   | ----------- |
| **/json**                     | Returns MFJSON data       |
| **/json/ts**                  | Returns the max and min timestamp  |
| **/tiles/{z}/{x}/{y}**        | Returns the tile `x`,`y`at zoom level `z`  |

As long as there is a table inside the databse with an identifier named `id` and a `tgeompoint` it should be possible to display data, 
however it is necessary to edit the query in `dbqueries.js` to match the name of the table in the databse.

The database credentials are described in `dbqueries.js` and they are set to the default values. If you have changed them please edit them to match your credentials.

# Vector tiles visualization
To display vector data, pg_tileserv is used in this project. To install it, please follow the instructions
described in the [pg_tileserv installation tutorial](https://access.crunchydata.com/documentation/pg_tileserv/latest/installation/).  It is not mandatory to install and use pg_tileserv because another solution has been implemented and requires no installation.

In order to switch between implementations, set the `usePgtileserv` variable in the `MapMVT.js` at line 22 to true for using the pg_tileserv solution or false otherwise.

For both implementations it is imperative to run the function in `mvt/tripsfct.sql`. 
If you are using another dataset, please edit this function to match your database.

More details are described in the [thesis](Visualization%20of%20Mobility%20Data%20on%20OpenLayers.pdf)


# Build & Tutorial
In order to reproduce this visualization you need to :
1. Clone the repository
2. Execute in the working directory : ```npm install```
2. Make sure that the database credentials in ```dbqueries.js``` match your database   
3. (Optional) If you have another dataset than the Danish AIS you have to adapt the queries used
   1. Edit the name of your table and id in``tripsfct.sql``
   2. Edit the name of your table in the queries of ``dbqueries.js``
5. Run the script that starts the API first by executing: ```npm run startAPI```
6. To start the application, run the build script and THEN the execution script : ```npm run build``` and THEN ```npm run start```<br/>
7. Finally to get the result, open the browser on ````localhost:3000````

## Vector tiles  or MFJSON
To run with the implemenation using MFJSON data, set the `isJSON` variable to true \
To run with the implemenation using vector tiles, set the `isJSON` variable to false \
The `isJSON` variable can be found inside `App.js` line 8

# Overview
### Danish AIS:

https://github.com/SoufianBk/OpenLayers_v2/assets/75175261/4fab054f-0c04-46d9-a358-61be3c3402f8

### New York GTFS:

https://github.com/SoufianBk/OpenLayers_v2/assets/75175261/6e7da17f-3909-431c-83bc-1b210550ae48

