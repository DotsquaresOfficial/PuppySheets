const axios = require('axios');

// Get Margin Requirments
const get_margin_requirments = async (req, res) => {
    try {
        let data = JSON.stringify({
            "currency": req.body.currency
          });
          
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/margin_requirements/',
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
            res.json({message:error});
          });
      } catch (error) {
        console.log(error);
        res.json({ message: error });
      }
};


module.exports = {
    get_margin_requirments
  }