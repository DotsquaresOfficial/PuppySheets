const axios = require('axios');

// POST Request For Quote
const post_request_for_quote = async (req, res) => {
    try {
        console.log(req.body);
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/request_for_quote/',
            headers: { 
              'Authorization': req.headers.authorization,
              "Content-Type": "application/json",
            },
            data:req.body
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
    post_request_for_quote
  }