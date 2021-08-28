/* eslint-disable camelcase */

exports.up = (pgm) => {
    // membuat table playlists
    pgm.createTable('playlists', {
        id: {
            type: 'VARCHAR(100)',
            primaryKey: true,
        },
        name: {
            type: 'VARCHAR(100)',
            notNull: true,
        },
        owner: {
            type: 'VARCHAR(100)',
            notNull: true,
        },
    });

    /*
      Menambahkan constraint UNIQUE, kombinasi dari kolom name dan owner.
      Guna menghindari duplikasi data antara nilai keduanya.
    */
    pgm.addConstraint('playlists', 'unique_name_and_owner', 'UNIQUE(name, owner)');

    // memberikan constraint foreign key pada kolom owner terhadap users.id
    pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    // menghapus tabel playlists
    pgm.dropTable('playlists');
};