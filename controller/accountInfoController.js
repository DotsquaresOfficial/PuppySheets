const axios = require('axios');

// account_info
const account_info = async (req, res) => {
    try {

          let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/account_info/',
            headers: { 
              'Authorization': req.headers.authorization,
            
            },
         
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
  account_info
  }