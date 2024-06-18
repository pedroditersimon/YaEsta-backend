import { useState } from 'react';
import './LikeButton.css';

export function sumarLike (likes){
  return likes +1;
}

export default function LikeButton({video, onClick}) {
  const [likes, setLike] = useState(0);

  return (
    <div
      onClick={(e)=>{e.stopPropagation(); setLike(sumarLike(likes));onClick();}}
      className="LikeButton"
    >
      <span>{likes > 0 && likes}</span>
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