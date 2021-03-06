var request = require('request');
var server = require('./server');
var Facility = require('./model');

var API_SEARCH_TYPES = {
    HOSPITALS: 'hospitals',
    PHARMACIES: 'pharmacies',
    GPS: 'gp_surgeries'
};

exports.searchTypes = API_SEARCH_TYPES;

/* Get Postcode from lat lng */
module.exports.getLatLngFromPostcode = function (postcode, callback) {
    request({
        url: 'https://api.postcodes.io/postcodes/' + postcode,
        qs: {},
        method: 'GET',
        json: {}
    }, function (error, response, body) {
        if (error) {
            console.log('Error getting lat lng: ', error);
            callback(0, 0);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
            callback(0, 0);
        }
        else {
            if (response.body['result'] != undefined)
                callback(response.body['result']['latitude'], response.body['result']['longitude']);
            else
                callback(0, 0);
        }
    });
};

/* Get User name */
module.exports.getUserNameAndLang = function (sender, callback) {
    request({
        url: 'https://graph.facebook.com/v2.6/' + sender + '?fields=first_name,locale',
        qs: { access_token : server.token },
        method: 'GET',
        json: {}
    }, function(error, response, body) {
        if (error) {
            console.log('Error getting name: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
        else {
            callback(response.body['first_name'],response.body['locale']);
        }
    });
};

/**
 * Request language from Facebook Graph
 * @param  {[type]}   sender   [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
module.exports.getLanguage = function(sender, callback, errorCallback) {
  request({
      url: 'https://graph.facebook.com/v2.6/' + sender + '?fields=id,name,languages',
      qs: { access_token : server.token },
      method: 'GET',
      json: {}
  }, function(error, response, body) {
      if (error) {
        console.log('in error callback');
        errorCallback(error);
      }
      if (error) {
          console.log('Error getting name: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
      else {
          callback(response.body);
      }
  });
};

/* Get nearest nhs facility details for menu */
module.exports.getNHSFacility = function (type, lat, lng, callback) {
    
    request({
        url: 'https://www.data.gov.uk/data/api/service/health/'+type+'/nearest?lat='+lat+'&lon='+lng,
        qs: {},
        method: 'GET',
        json: {}
    }, function(error, response, body) {
        if (error) {
            console.log('Error getting nhs facility: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
        else {
            if (response.body['result'] != undefined && response.body['result'].length > 0){
                var dataArray = [];
                var count = 0;
                response.body['result'].every(function(nhsItem){
                    var modelVar = new Facility(
                        nhsItem['name'],
                        nhsItem['phone'],
                        nhsItem['website'],
                        nhsItem['email'],
                        nhsItem['latitude'],
                        nhsItem['longitude']);
                    dataArray.push(modelVar);
                    count += 1;
                    return count <= 4;
                     });
                callback(dataArray);
            }
            else
                callback("error");
        }
    });
};
