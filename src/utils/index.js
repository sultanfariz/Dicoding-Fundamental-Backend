const mapSongDBToModel = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

const mapSongDBToModelSpecified = ({
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

const mapPlaylistDBToModel = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username,
});

module.exports = { mapSongDBToModel, mapSongDBToModelSpecified, mapPlaylistDBToModel };