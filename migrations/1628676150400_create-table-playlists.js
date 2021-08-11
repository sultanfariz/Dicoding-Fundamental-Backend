/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    // membuat table playlists
    pgm.createTable('playlists', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        name: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        owner: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    });

    /*
      Menambahkan constraint UNIQUE, kombinasi dari kolom playlist_id dan owner.
      Guna menghindari duplikasi data antara nilai keduanya.
    */
    pgm.addConstraint('playlists', 'unique_playlist_id_and_owner', 'UNIQUE(playlist_id, owner)');

    // memberikan constraint foreign key pada kolom owner terhadap users.id
    pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    // menghapus tabel playlists
    pgm.dropTable('playlists');
};