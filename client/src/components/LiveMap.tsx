import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const machines = [
    { id: 1, name: "Excavator XL-200", status: "Rented", lat: -1.9441, lng: 30.0619 }, // Kigali coords approx
    { id: 2, name: "Bulldozer B-50", status: "Available", lat: -1.9500, lng: 30.1000 },
    { id: 3, name: "Crane C-100", status: "Rented", lat: -1.9350, lng: 30.0800 },
];

export const LiveMap = () => {
    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm z-0">
            <MapContainer
                center={[-1.9441, 30.0619]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {machines.map(m => (
                    <Marker key={m.id} position={[m.lat, m.lng]}>
                        <Popup>
                            <div className="font-bold">{m.name}</div>
                            <div className={m.status === 'Rented' ? 'text-blue-600' : 'text-green-600'}>{m.status}</div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};
