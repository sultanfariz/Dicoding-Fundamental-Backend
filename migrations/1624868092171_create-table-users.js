/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.createTable('users', {
        id: {
            type: 'VARCHAR(100)',
            primaryKey: true,
        },
        username: {
            type: 'VARCHAR(100)',
            unique: true,
            notNull: true,
        },
        password: {
            type: 'TEXT',
            notNull: true,
        },
        fullname: {
            type: 'TEXT',
            notNull: true,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('users');
};