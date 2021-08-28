const ClientError = require('../../exceptions/ClientError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class ExportsHandler {
	constructor(service, validator) {
		this._service = service;
		this._validator = validator;

		this.postExportPlaylistsHandler = this.postExportPlaylistsHandler.bind(this);
	}

	async postExportPlaylistsHandler(request, h) {
		try {
			this._validator.validateExportPlaylistsPayload(request.payload);
			const { id: credentialId } = request.auth.credentials;

			// playlists = await this._service.getPlaylists(credentialId);

			// const playlistQuery = {
			// 	text: `SELECT playlists.* FROM playlists
			// 	LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
			// 	WHERE playlists.owner = $1 OR collaborations.user_id = $1
			// 	GROUP BY playlists.id`,
			// 	values: [credentialId],
			// };
			// let result = await this._pool.query(playlistQuery);
			// if (!result.rowCount) {
			// 	return [];
			// }

			const message = {
				userId: credentialId,
				targetEmail: request.payload.targetEmail,
			};
			await this._service.sendMessage(JSON.stringify(message), 'export:playlists');

			const response = h.response({
				status: 'success',
				message: 'Permintaan Anda sedang kami proses',
			});
			response.code(201);
			return response;
		} catch (error) {
			if (error instanceof ClientError) {
				const response = h.response({
					status: 'fail',
					message: error.message,
				});
				response.code(error.statusCode);
				return response;
			}
			// Server ERROR!
			const response = h.response({
				status: 'error',
				message: 'Maaf, terjadi kesalahan pada server kami',
			});
			response.code(500);
			console.error(error);
			return response;
		}
	}
}

module.exports = ExportsHandler;