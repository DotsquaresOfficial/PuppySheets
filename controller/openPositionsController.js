const axios = require('axios');

// Get Open Positions
const get_open_positions = async (req, res) => {
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/cfd/open_positions/',
            headers: { 
              'Authorization': req.headers.authorization
            }
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
    get_open_positions
  }