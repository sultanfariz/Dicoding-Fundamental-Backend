// create producer service to send message to queue through amqp protocol
const amqp = require('amqplib');

const ProducerService = {
    sendMessage: async (message, queueName) => {
        const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName, { durable: true });
        await channel.sendToQueue(queueName, Buffer.from(message));

        setTimeout(() => {
            connection.close();
        }, 1000);
    },
};

module.exports = ProducerService;