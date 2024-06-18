import Thumbnail from './Thumbnail.js';
//import LikeButton from './LikeButton.js';
import './Video.css';
import './LikeButton.css';
import { useState } from 'react';
var vecesRender = 0;
function sumarLike (likes){
  return likes +1;
}

function LikeButton({video, onClick}) {
  const [likes, setLike] = useState(0);
  vecesRender+=1;
  return (
    <div
      onClick={(e)=>{e.stopPropagation(); setLike(sumarLike(likes));onClick();}}
      className="LikeButton"
    >
      <span>{vecesRender}</span>
      <img 
        alt='' 
        src="https://cdn.pixabay.com/photo/2020/09/30/07/48/heart-5614865_1280.png"
      />
      <form onSubmit={(e) => {e.preventDefault(); alert('¡Enviando!')}}>
      <input />
      <button>Enviar</button>
    </form>
    </div>
  );
}

export default function Video({video, likes, onClick}) {
  const [asd, setAas] = useState(0);

  return (
    <div className="Video" onClick={()=>{setAas(asd+1);alert("asd")}}>
      <Thumbnail video={video}></Thumbnail>
      <a href={video.url}
        target='_blank'
        rel="noreferrer noreferrer"
      >
        <h3>{video.tittle}</h3>
        <p>{video.description}</p>
      </a>
      <LikeButton video={video} likes={0} onClick={onClick}></LikeButton>
    </div>
  );
}