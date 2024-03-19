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
            url: `${process.env.API_BASE_URL}instruments/`,
            headers: { 
              'Authorization': `Token ${process.env.AUTHORIZATION}`,
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