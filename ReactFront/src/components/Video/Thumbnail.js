import './Thumbnail.css';

export default function Thumbnail({video}) {

  // los estilos son un objeto que igualmente se encierran en llave
  // una llave para el objeto y otra para para incrustar js
  var thumbnailStyle = {
    backgroundImage: `url(${video.thumbnail_url})`
  };

  return (
    <a href={video.url}
      target='_blank'
      className="Thumbnail"
      rel="noreferrer noreferrer"
      style={thumbnailStyle}
    >
    </a>
  );
}
