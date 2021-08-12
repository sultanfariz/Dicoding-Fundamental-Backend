const mapDBToModel = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const mapDBToModelSpecified = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  created_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  insertedAt: created_at,
  updatedAt: updated_at,
});

// const mapPlaylistsDBToModel = ({
//   id,
//   title,
//   performer,
// }) => ({
//   id,
//   title,
//   performer,
// });

module.exports = { mapDBToModel, mapDBToModelSpecified };