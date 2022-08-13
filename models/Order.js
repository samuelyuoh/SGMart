const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
var Schema = db.Schema

const Order = db.define('order',
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
        name: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        address: {type: Sequelize.STRING},
        phone: {type: Sequelize.INTEGER},
        delivery_date: {type: Sequelize.DATE},
        delivery_time: {type: Sequelize.STRING}
    });
module.exports = Order;