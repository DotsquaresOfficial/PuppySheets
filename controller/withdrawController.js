const axios = require('axios');
const FormData = require('form-data');
// Get a Withdraw
const get_a_withdraw= async (req, res) => {
    try {
      
      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://portal.bcxpro.io/api/withdrawal-status',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : req.body
      };
      console.log(req.body);
      const response= await axios.request(config)
      console.log(response.data);
      const {status,txn_id,date,type,amount,notes,order_id,wallet_address_other}=response.data[0];
      res.json({
              "status": status,
              "txn_id": txn_id,
              "date": date,
              "type": type,
              "amount":amount,
              "notes": notes,
              "order_id": order_id,
              "wallet_address": wallet_address_other
          }
      );
      } catch (error) {
        console.log(error);
        res.status(400).json(error);
      }
};


module.exports = {
    get_a_withdraw,
  }