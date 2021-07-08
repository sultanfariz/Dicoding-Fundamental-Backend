require('dotenv').config();

const Hapi = require('@hapi/hapi');
const songs = require('./api/songs');
const SongsService = require('./services/SongsService');
const SongsValidator = require('./validator/songs');
 
const init = async () => {
  const songsService = new SongsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // server.ext('onPreResponse', (request, h) => {
  //   // mendapatkan konteks response dari request
  //   const { response } = request;
  //   if (response instanceof ClientError) {
  //     // membuat response baru dari response toolkit sesuai kebutuhan error handling
  //     const newResponse = h.response({
  //       status: 'fail',
  //       message: response.message,
  //     });
  //     newResponse.code(response.statusCode);
  //     return newResponse;
  //   }
  //   // jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
  //   return response.continue || response;
  // });
 
  await server.register({
    plugin: songs,
    options: {
      service: songsService,
	  validator: SongsValidator,
    },
  });
 
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};
 
init();