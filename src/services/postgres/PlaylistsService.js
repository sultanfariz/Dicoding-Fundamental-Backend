const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapSongDBToModel, mapPlaylistDBToModel } = require('../../utils');

class PlaylistsService {
  constructor(collaborationService, cacheService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._cacheService = cacheService;
  }

  async addPlaylist({ name, owner }) {
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

  async addSongToPlaylist({ playlistId, songId }) {
    const id = `playlistsongs-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke dalam playlist');
    }
    // delete playlist dari dalam cache
    await this._cacheService.delete(`playlists:${playlistId}`);
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

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal dihapus');
    }
  }

  async getPlaylists(owner) {
    const playlistQuery = {
      text: `SELECT playlists.* FROM playlists
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id`,
      values: [owner],
    };
    let result = await this._pool.query(playlistQuery);
    if (!result.rowCount) {
      return [];
    }

    const ownerQuery = {
      text: `SELECT username FROM users WHERE id = $1`,
      values: [result.rows[0].owner],
    };
    const ownerResult = await this._pool.query(ownerQuery);
    if (!ownerResult.rowCount) {
      throw new NotFoundError('User tidak ditemukan');
    }

    result.rows[0].username = ownerResult.rows[0].username;
    return result.rows.map(mapPlaylistDBToModel);
  }

  async getSongsInPlaylist(playlistId) {
    try {
      // mendapatkan lagu dalam playlist dari cache
      const result = await this._cacheService.get(`playlists:${playlistId}`);
      return JSON.parse(result);
    } catch (error) {
      let songs = [];
      const playlistQuery = {
        text: `SELECT song_id FROM playlistsongs WHERE playlist_id = $1`,
        values: [playlistId],
      };
      const songsId = await this._pool.query(playlistQuery);
      if (!songsId.rowCount) {
        throw new NotFoundError('Playlist kosong');
      }

      for (const songId of songsId.rows) {
        const songQuery = {
          text: `SELECT id, title, performer FROM songs WHERE id = $1`,
          values: [songId.song_id],
        };
        const song = await this._pool.query(songQuery);
        if (song) songs.push(song.rows[0]);
      }
      const mappedResult = songs.map(mapSongDBToModel);
      // menyimpan catatan dalam cache sebelum return
      await this._cacheService.set(`playlists:${playlistId}`, JSON.stringify(mappedResult));

      return mappedResult;
    }
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: `DELETE FROM playlistsongs WHERE song_id = $1 AND playlist_id = $2 RETURNING id`,
      values: [songId, playlistId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari Playlist');
    }

    // delete playlist dari dalam cache
    await this._cacheService.delete(`playlists:${playlistId}`);
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;