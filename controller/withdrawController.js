const axios = require('axios');

// Withdraw
const withdraw = async (req, res) => {
    try {

          let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/withdrawal',
            headers: { 
              'Authorization': req.headers.authorization,
              'Content-Type': 'application/json'
            },
            data : req.body
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


// Get a Withdraw
const get_a_withdraw= async (req, res) => {
    try {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.uat.b2c2.net/withdrawal/'+req.params.withdrawal_id,
        headers: { 
          'Authorization': req.headers.authorization,
        },
      };
      axios.request(config)
      .then((response) => {
        res.json(response.data);
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.json(error);
        console.log(error);
      });
      
      } catch (error) {
        console.log(error);
        res.json(error);
      }
};

// Delete a Withdraw
const delete_a_withdraw= async (req, res) => {
    try {
      let config = {
        method: 'delete',
        maxBodyLength: Infinity,
        url: 'https://api.uat.b2c2.net/withdrawal/'+req.params.withdrawal_id,
        headers: { 
          'Authorization': req.headers.authorization,
        },
      };
      axios.request(config)
      .then((response) => {
        res.json(response.data);
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.json(error);
        console.log(error);
      });
      
      } catch (error) {
        console.log(error);
        res.json(error);
      }
};

// Get All Withdraw
const get_all_withdraw= async (req, res) => {
    try {
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.uat.b2c2.net/withdrawal/',
        headers: { 
          'Authorization': req.headers.authorization,
        },
      };
      axios.request(config)
      .then((response) => {
        res.json(response.data);
        console.log(JSON.stringify(response.data));
      })
      .catch((error) => {
        res.json(error);
        console.log(error);
      });
      
      } catch (error) {
        console.log(error);
        res.json(error);
      }
};

module.exports = {
    withdraw,
    get_a_withdraw,
    delete_a_withdraw,
    get_all_withdraw
  }