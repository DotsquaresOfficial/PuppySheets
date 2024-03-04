const axios = require('axios');
const RFQ = require('../models/RFQ');

// POST Request For Quote
const post_request_for_quote = async (req, res) => {
    try {
        console.log(req.body);
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${process.env.API_BASE_URL}request_for_quote/`,
            headers: { 
              'Authorization': req.headers.authorization,
              "Content-Type": "application/json",
            },
            data:req.body
          };
          
          axios.request(config)
          .then((response) => {
            const created = new Date(new Date(response.data.created).getTime());
            const updatedTimestamp = new Date(new Date(response.data.valid_until).getTime() + 100 * 1000);
            console.log(JSON.stringify(response.data));
            RFQ.findOneAndUpdate(
              { client_rfq_id: response.data.client_rfq_id },
              {
                created: created,
                valid_until: updatedTimestamp,
                rfq_id: response.data.rfq_id,
                client_rfq_id: response.data.client_rfq_id,
                quantity: Number(response.data.quantity),
                side: response.data.side,
                instrument: response.data.instrument,
                price: Number(response.data.price)
              },
              { upsert: true, new: true } 
            ).then(()=>{
              res.json({
                ...response.data,
                valid_until:updatedTimestamp
              });
            });
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