const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
// Create videos table in MySQL Database
const Delivery = db.define('delivery',
    {
        // product_name: { type: Sequelize.STRING },
        // product_price: { type: Sequelize.STRING(2000) },
        // discount: { type: Sequelize.STRING },
        // stock: { type: Sequelize.STRING },
        // desc: { type: Sequelize.STRING },
        // pub_date: { type: Sequelize.DATE },
        // brand_id: { type: Sequelize.INTEGER },
        // category_id: { type: Sequelize.INTEGER },
        // image: { type: Sequelize.STRING }
        delivery_date: {type: Sequelize.DATE},
        delivery_time: {type: Sequelize.STRING},
        delivery_address : {type: Sequelize.STRING},
        delivery_city : {type: Sequelize.STRING},
        delivery_state : {type: Sequelize.STRING},
        delivery_zip : {type: Sequelize.STRING}
    });
module.exports = Delivery;