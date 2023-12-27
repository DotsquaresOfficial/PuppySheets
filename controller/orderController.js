const axios = require('axios');

// Post an order
const post_an_order = async (req, res) => {
    try {
        let data = JSON.stringify({
            'instrument': req.body.instrument,
            'side': req.body.side,
            'quantity': req.body.quantity,
            'client_order_id': req.body.uuid,
            'price': req.body.price,
            'order_type': 'FOK',
            'valid_until': req.body.valid_until,
            'executing_unit': req.body.executing_unit,
        
          });

        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/order/',
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

// Get an order
const get_an_order = async (req, res) => {
    try {
       

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/order/'+res.body.orderId,
            headers: { 
              'Authorization': req.headers.Authorization
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
// Get an order
const get_multiple_order = async (req, res) => {
    try {
        let data = JSON.stringify({
            'created__gte': req.body.created__gte,
            'created__lt': req.body.created__lt
          });

        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/order/',
            headers: { 
              'Authorization': req.headers.Authorization
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
    post_an_order,
    get_an_order,
    get_multiple_order
  }