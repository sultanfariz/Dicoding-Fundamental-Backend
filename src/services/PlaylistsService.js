const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../exceptions/InvariantError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist(name, owner) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async deletePlaylist(name, owner) {
    const query = {
      text: 'DELETE FROM playlists WHERE name = $1 AND owner = $2 RETURNING id',
      values: [name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal dihapus');
    }
  }

  async getPlaylistsByOwner(owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE owner = $1',
      values: [owner],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const song = result.rows[0];
    if (song.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  // async verifyCollaborator(name, owner) {
  //   const query = {
  //     text: 'SELECT * FROM playlists WHERE name = $1 AND owner = $2',
  //     values: [name, owner],
  //   };

  //   const result = await this._pool.query(query);

  //   if (!result.rowCount) {
  //     throw new InvariantError('Kolaborasi gagal diverifikasi');
  //   }
  // }
}

module.exports = PlaylistsService;