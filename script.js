//this script gets data from the nationbuilder people API, 
//transforms results and pushes them to a preexisting cartoDB table


var request = require('request'),
  Mustache = require('mustache'),
  squel = require("squel"),
  CartoDB = require('cartodb'),
  config = require('./config');


var nbUrl = Mustache.render('https://{{nbSlug}}.nationbuilder.com/api/v1/people?limit={{nbRows}}&access_token={{nbApiToken}}', config);


request({
  url: nbUrl,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
}, function(err, response, body) {
  var people = JSON.parse(body).results;

  people.forEach(function(person,i) {
    people[i] = transform(person);
  })

  var query = buildQuery(people);
  console.log(query);

  pushToCarto(query);
});

function transform(person) {
  var p = person;
  var newPerson = {
    //build the_geom from the lat/lng fields
    the_geom: squel.fval(Mustache.render('ST_SetSRID(ST_MakePoint({{lng}}, {{lat}}), 4326)',{
      lat: p.primary_address.lat,
      lng: p.primary_address.lng
    })),
    birthdate: p.birthdate,
    do_not_call: p.do_not_call,
    do_not_contact: p.do_not_contact,
    id: p.id,
    address_address1: p.primary_address.address1,
    address_address2: p.primary_address.address2,
    address_address3: p.primary_address.address3,
    address_city: p.primary_address.city,
    address_county: p.primary_address.county,
    address_state: p.primary_address.state,
    address_country_code: p.primary_address.country_code,
    address_zip: p.primary_address.zip,
    address_fips: p.primary_address.fips,
    //validate lat and lng (and all non-text values, really)
    lat: (p.primary_address.lat ? p.primary_address.lat : null),
    lng: (p.primary_address.lng ? p.primary_address.lng : null),
    profile_image_url_ssl: p.profile_image_url_ssl,
    sex: p.sex
  }

  console.log(newPerson);

  return newPerson;

}

function buildQuery(people) {

  var query = squel.insert()
        .into(config.cdbTablename)
        .setFieldsRows(people)
        .toString()

  return query;
  //send it


}

//takes a insert query and executes it using the SQL API (truncates the table first)
function pushToCarto(query) {
  //initialize cartodb connection client
  var client = new CartoDB({
    user: config.cdbUsername,
    api_key: config.cdbApiKey
  });

  client.on('connect', function() {
    console.log("connected");
    client
      .query('TRUNCATE TABLE {cdbTablename}', config, function(err, res){
        console.log(res);
      })
      .query(query, {}, function(err, res){
        console.log(res);
      })
  });

  client.connect();
}
