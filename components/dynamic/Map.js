import dynamic from 'next/dynamic';

const MapBox = dynamic(() => import('../../components/Map'), {
  ssr: false
});

export default MapBox;