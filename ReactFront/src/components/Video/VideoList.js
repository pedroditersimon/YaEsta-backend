import './VideoList.css';
import Video from './Video.js';
import { useState } from 'react';

const videos = [
  {
    tittle: "Exploring the Universe: A Journey Through Space",
    description: "Join us on an incredible journey through the cosmos, exploring distant galaxies, black holes, and the mysteries of the universe.",
    url: "https://www.example.com/exploring-the-universe",
    thumbnail_url: "https://static-cse.canva.com/blob/1539798/1600w-wK95f3XNRaM.jpg"
  },
  {
    tittle: "The WonLife",
    description: "Divarihe sea.",
    url: "https://www.example.com/wonders-of-the-ocean",
    thumbnail_url: "https://biteable.com/wp-content/uploads/2017/07/Video-thumbnails-size-how-to-make-them.png"
  }
];

export default function VideoList({videos}) {
  const [likes, setLike] = useState(0);

  return (
    <div className="VideoList">
      {videos.map((v)=> <Video video={v} likes={likes} onClick={()=>alert("sumando")} ></Video>)}
    </div>
  );
}
