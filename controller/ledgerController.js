const axios = require('axios');

// Get ledger
const get_ledger= async (req, res) => {
    try {

        console.log(req.headers.authorization);
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/ledger/',
            headers: { 
                'Authorization': `Token ${process.env.AUTHORIZATION}`,
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
    get_ledger
  }