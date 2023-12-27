const axios = require('axios');

// Get Instruments
const get_instruments = async (req, res) => {
    try {
        let data = JSON.stringify({
            "all": req.body.all===true?true:false
          });

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/instruments/',
            headers: { 
              'Authorization': req.headers.authorization,
              "Content-Type": "application/json",
            },
            data:data
          };
          
          axios.request(config)
          .then((response) => {
            console.log(JSON.stringify(response.data));
            res.json(response.data);
          })
          .catch((error) => {
            console.log(error);
            res.json(error);
          });
      } catch (error) {
        console.log(error);
        res.json(error);
      }
};


module.exports = {
    get_instruments
  }