const axios = require('axios');
const RFQ = require('../models/RFQ');

// Post an order
const order = async (req, res) => {
    try {
      
      if(req.body.client_rfq_id){
        RFQ.findOne({ client_rfq_id: req.body.client_rfq_id}).then((data)=>{
     
          if (!data) {
         
            axios.request(config)
            .then((response) => {
              // console.log(JSON.stringify(response.data));
              let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${process.env.API_BASE_URL}order`,
                headers: { 
                  'Authorization': req.headers.authorization, 
                  'Content-Type': 'application/json'
                },
                data : req.body
              };
              res.json(response.data);
            })
            .catch((error) => {
              console.log(error);
              res.json(error);
            });
          }else{
            const validTill = new Date(new Date().getTime() + 300 * 1000);
            let config = {
              method: 'post',
              maxBodyLength: Infinity,
              url: `${process.env.API_BASE_URL}order`,
              headers: { 
                'Authorization': req.headers.authorization, 
                'Content-Type': 'application/json'
              },
              data : {...data,valid_until:validTill,executing_unit:'risk-adding-strategy'}
            };
           
            axios.request(config)
            .then((response) => {
              // console.log(JSON.stringify(response.data));
              res.json(response.data);
            })
            .catch((error) => {
              console.log(error);
              res.status(400).json(error);
            });
          }
        })
      }else{
        res.status(400).json({
          message:'client_rfq_id not found'
        });
      }
     
     
      } catch (error) {
        console.log(error);
        res.status(400).json(error);
      }
};

// Get an order
const get_an_order = async (req, res) => {
    try {
        console.log(req);
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/order/'+req.params.order_id,
            headers: { 
              'Authorization': req.headers.authorization
            },
          };
          axios.request(config)
          .then((response) => {
            console.log(JSON.stringify(response.data));
            res.json(response.data);
          })
          .catch((error) => {
            console.log(error);
            res.status(400).json(error);
          });
      } catch (error) {
        console.log(error);
        res.status(400).json(error);
      }
};
// Get an order
const get_multiple_order = async (req, res) => {
    try {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.uat.b2c2.net/order/',
            headers: { 
              'Authorization': req.headers.authorization
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
            res.status(400).json(error);
          });
      } catch (error) {
        console.log(error);
        res.status(400).json(error);
      }
};

module.exports = {
    order,
    get_an_order,
    get_multiple_order
  }