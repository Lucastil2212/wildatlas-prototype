#!/usr/bin/env python3
"""Seed WildAtlas / Manticore acoustic ecosystem database from live providers.

Builds data/acoustic-ecosystems.js — a place-indexed catalog of habitat
soundscapes with licensed clips from iNaturalist (primary) and optional GBIF
enrichment. Designed as the offline core of the acoustic data service; the
client falls back to live provider queries when a pin is far from seeded sites.
"""

from __future__ import annotations

import json
import math
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "acoustic-ecosystems.js"
INAT = "https://api.inaturalist.org/v1/observations"
UA = "ManticoreAcousticSeed/1.0 (WildAtlas prototype; educational)"

# Named acoustic ecosystems worldwide — place-first catalog for the atlas.
ECOSYSTEMS: list[dict] = [
    # --- Curated atlas journeys ---
    {"id": "amazon", "name": "Amazon Rainforest", "region": "Amazonas, Brazil", "lat": -3.4653, "lon": -62.2159, "biomeKey": "rainforest", "habitat": "terra firme & várzea rainforest"},
    {"id": "serengeti", "name": "Serengeti Plains", "region": "Tanzania", "lat": -2.3333, "lon": 34.8333, "biomeKey": "savanna", "habitat": "acacia savanna"},
    {"id": "great-barrier-reef", "name": "Great Barrier Reef", "region": "Queensland, Australia", "lat": -18.2871, "lon": 147.6992, "biomeKey": "coral", "habitat": "coral reef edge"},
    {"id": "svalbard", "name": "Svalbard Archipelago", "region": "Norway", "lat": 78.2232, "lon": 15.6267, "biomeKey": "arctic", "habitat": "arctic tundra & fjord"},
    {"id": "galapagos", "name": "Galápagos Islands", "region": "Ecuador", "lat": -0.9538, "lon": -90.9656, "biomeKey": "islands", "habitat": "volcanic island scrub"},
    {"id": "everglades", "name": "Everglades", "region": "Florida, USA", "lat": 25.2866, "lon": -80.8987, "biomeKey": "wetlands", "habitat": "sawgrass marsh & mangrove"},
    {"id": "yellowstone", "name": "Yellowstone", "region": "Wyoming, USA", "lat": 44.6, "lon": -110.5, "biomeKey": "temperate", "habitat": "montane forest & meadow"},
    {"id": "sonoran", "name": "Sonoran Desert", "region": "Arizona, USA", "lat": 32.25, "lon": -112.9, "biomeKey": "desert", "habitat": "saguaro desert scrub"},
    # --- Extra curated (content.js) + global coverage ---
    {"id": "monteverde", "name": "Monteverde Cloud Forest", "region": "Costa Rica", "lat": 10.301, "lon": -84.811, "biomeKey": "rainforest", "habitat": "montane cloud forest"},
    {"id": "borneo-danum", "name": "Danum Valley", "region": "Sabah, Malaysia", "lat": 4.96, "lon": 117.8, "biomeKey": "rainforest", "habitat": "dipterocarp rainforest"},
    {"id": "congo-basin", "name": "Congo Basin", "region": "Republic of the Congo", "lat": 0.5, "lon": 17.0, "biomeKey": "rainforest", "habitat": "central African rainforest"},
    {"id": "okinawa-reef", "name": "Okinawa Reefs", "region": "Japan", "lat": 26.5, "lon": 128.0, "biomeKey": "coral", "habitat": "subtropical reef"},
    {"id": "madagascar-spiny", "name": "Spiny Forest", "region": "Madagascar", "lat": -24.1, "lon": 44.0, "biomeKey": "desert", "habitat": "spiny thicket"},
    {"id": "pantanal", "name": "Pantanal", "region": "Brazil", "lat": -17.0, "lon": -57.0, "biomeKey": "wetlands", "habitat": "seasonal floodplain"},
    {"id": "okavango", "name": "Okavango Delta", "region": "Botswana", "lat": -19.25, "lon": 22.9, "biomeKey": "wetlands", "habitat": "inland delta"},
    {"id": "kakadu", "name": "Kakadu", "region": "Northern Territory, Australia", "lat": -12.8, "lon": 132.6, "biomeKey": "wetlands", "habitat": "monsoonal wetlands"},
    {"id": "sundarbans", "name": "Sundarbans", "region": "Bangladesh / India", "lat": 21.95, "lon": 89.18, "biomeKey": "wetlands", "habitat": "mangrove forest"},
    {"id": "yasuni", "name": "Yasuní", "region": "Ecuador", "lat": -0.7, "lon": -76.4, "biomeKey": "rainforest", "habitat": "Amazonian rainforest"},
    {"id": "manu", "name": "Manu", "region": "Peru", "lat": -12.0, "lon": -71.5, "biomeKey": "rainforest", "habitat": "Andean Amazon"},
    {"id": "atlantic-forest", "name": "Atlantic Forest", "region": "Brazil", "lat": -23.45, "lon": -45.07, "biomeKey": "rainforest", "habitat": "mata atlântica"},
    {"id": "western-ghats", "name": "Western Ghats", "region": "India", "lat": 10.2, "lon": 76.8, "biomeKey": "rainforest", "habitat": "montane evergreen forest"},
    {"id": "sinharaja", "name": "Sinharaja", "region": "Sri Lanka", "lat": 6.4, "lon": 80.4, "biomeKey": "rainforest", "habitat": "wet zone rainforest"},
    {"id": "kinabalu", "name": "Mount Kinabalu", "region": "Malaysia", "lat": 6.075, "lon": 116.558, "biomeKey": "rainforest", "habitat": "montane rainforest"},
    {"id": "new-guinea-huon", "name": "Huon Peninsula", "region": "Papua New Guinea", "lat": -6.5, "lon": 147.0, "biomeKey": "rainforest", "habitat": "Melanesian rainforest"},
    {"id": "queensland-wet-tropics", "name": "Wet Tropics", "region": "Queensland, Australia", "lat": -17.4, "lon": 145.8, "biomeKey": "rainforest", "habitat": "tropical wet forest"},
    {"id": "taiga-finland", "name": "Finnish Taiga", "region": "Finland", "lat": 66.5, "lon": 25.7, "biomeKey": "temperate", "habitat": "boreal forest"},
    {"id": "banff", "name": "Banff Rockies", "region": "Alberta, Canada", "lat": 51.5, "lon": -116.0, "biomeKey": "temperate", "habitat": "montane forest"},
    {"id": "olympic", "name": "Olympic Peninsula", "region": "Washington, USA", "lat": 47.8, "lon": -123.6, "biomeKey": "temperate", "habitat": "temperate rainforest"},
    {"id": "appalachian", "name": "Great Smoky Mountains", "region": "Tennessee, USA", "lat": 35.6, "lon": -83.5, "biomeKey": "temperate", "habitat": "deciduous highland forest"},
    {"id": "patagonia-torres", "name": "Torres del Paine", "region": "Chile", "lat": -51.0, "lon": -73.0, "biomeKey": "temperate", "habitat": "Patagonian steppe & forest"},
    {"id": "alps-engadin", "name": "Engadin Alps", "region": "Switzerland", "lat": 46.5, "lon": 9.85, "biomeKey": "temperate", "habitat": "alpine meadow & forest"},
    {"id": "caucasus", "name": "Greater Caucasus", "region": "Georgia", "lat": 42.5, "lon": 44.5, "biomeKey": "temperate", "habitat": "montane forest"},
    {"id": "himalaya-annapurna", "name": "Annapurna Foothills", "region": "Nepal", "lat": 28.4, "lon": 84.0, "biomeKey": "temperate", "habitat": "Himalayan mid-hills"},
    {"id": "new-zealand-fiordland", "name": "Fiordland", "region": "New Zealand", "lat": -45.0, "lon": 167.0, "biomeKey": "temperate", "habitat": "beech rainforest"},
    {"id": "tasmania", "name": "Tasmanian Wilderness", "region": "Australia", "lat": -42.1, "lon": 146.0, "biomeKey": "temperate", "habitat": "temperate wilderness"},
    {"id": "kruger", "name": "Kruger Lowveld", "region": "South Africa", "lat": -24.0, "lon": 31.5, "biomeKey": "savanna", "habitat": "bushveld savanna"},
    {"id": "masai-mara", "name": "Maasai Mara", "region": "Kenya", "lat": -1.5, "lon": 35.1, "biomeKey": "savanna", "habitat": "grassland savanna"},
    {"id": "etosha", "name": "Etosha", "region": "Namibia", "lat": -18.9, "lon": 16.3, "biomeKey": "savanna", "habitat": "salt pan savanna"},
    {"id": "cerrado", "name": "Cerrado", "region": "Brazil", "lat": -15.8, "lon": -47.9, "biomeKey": "savanna", "habitat": "tropical savanna woodland"},
    {"id": "llanos", "name": "Los Llanos", "region": "Venezuela", "lat": 7.9, "lon": -67.5, "biomeKey": "savanna", "habitat": "seasonal flooded plains"},
    {"id": "kimberley", "name": "Kimberley", "region": "Western Australia", "lat": -16.5, "lon": 126.0, "biomeKey": "savanna", "habitat": "tropical savanna"},
    {"id": "sahel-niger", "name": "Niger Sahel", "region": "Niger", "lat": 13.5, "lon": 2.1, "biomeKey": "savanna", "habitat": "Sahel woodland"},
    {"id": "outback-uluru", "name": "Central Australia", "region": "Northern Territory, Australia", "lat": -25.3, "lon": 131.0, "biomeKey": "desert", "habitat": "arid red centre"},
    {"id": "atacama", "name": "Atacama", "region": "Chile", "lat": -23.5, "lon": -69.5, "biomeKey": "desert", "habitat": "hyper-arid desert"},
    {"id": "sahara-ahaggar", "name": "Ahaggar", "region": "Algeria", "lat": 23.3, "lon": 5.6, "biomeKey": "desert", "habitat": "montane Sahara"},
    {"id": "namib", "name": "Namib Desert", "region": "Namibia", "lat": -24.0, "lon": 15.0, "biomeKey": "desert", "habitat": "coastal fog desert"},
    {"id": "gobi", "name": "Gobi Desert", "region": "Mongolia", "lat": 43.0, "lon": 105.0, "biomeKey": "desert", "habitat": "cold desert steppe"},
    {"id": "thar", "name": "Thar Desert", "region": "India", "lat": 27.0, "lon": 71.0, "biomeKey": "desert", "habitat": "arid scrub"},
    {"id": "mojave", "name": "Mojave Desert", "region": "California, USA", "lat": 35.0, "lon": -115.5, "biomeKey": "desert", "habitat": "creosote desert"},
    {"id": "death-valley", "name": "Death Valley", "region": "California, USA", "lat": 36.5, "lon": -117.0, "biomeKey": "desert", "habitat": "basin desert"},
    {"id": "chihuahuan", "name": "Chihuahuan Desert", "region": "Mexico / USA", "lat": 30.0, "lon": -105.0, "biomeKey": "desert", "habitat": "desert grassland"},
    {"id": "camargue", "name": "Camargue", "region": "France", "lat": 43.5, "lon": 4.5, "biomeKey": "wetlands", "habitat": "Mediterranean wetlands"},
    {"id": "danube-delta", "name": "Danube Delta", "region": "Romania", "lat": 45.2, "lon": 29.3, "biomeKey": "wetlands", "habitat": "river delta marsh"},
    {"id": "norfolk-broads", "name": "Norfolk Broads", "region": "United Kingdom", "lat": 52.7, "lon": 1.5, "biomeKey": "wetlands", "habitat": "lowland fen"},
    {"id": "okefenokee", "name": "Okefenokee", "region": "Georgia, USA", "lat": 30.7, "lon": -82.3, "biomeKey": "wetlands", "habitat": "blackwater swamp"},
    {"id": "baja-magdalena", "name": "Bahía Magdalena", "region": "Mexico", "lat": 24.6, "lon": -112.0, "biomeKey": "wetlands", "habitat": "coastal lagoon"},
    {"id": "wadden-sea", "name": "Wadden Sea", "region": "Netherlands / Germany", "lat": 53.5, "lon": 6.5, "biomeKey": "wetlands", "habitat": "intertidal mudflat"},
    {"id": "lake-baikal", "name": "Lake Baikal", "region": "Russia", "lat": 53.5, "lon": 108.0, "biomeKey": "temperate", "habitat": "boreal lake shore"},
    {"id": "yellow-river-delta", "name": "Yellow River Delta", "region": "China", "lat": 37.7, "lon": 119.1, "biomeKey": "wetlands", "habitat": "coastal wetlands"},
    {"id": "red-sea-ras-mohammed", "name": "Ras Mohammed", "region": "Egypt", "lat": 27.73, "lon": 34.25, "biomeKey": "coral", "habitat": "Red Sea reef"},
    {"id": "belize-barrier", "name": "Belize Barrier Reef", "region": "Belize", "lat": 17.3, "lon": -87.5, "biomeKey": "coral", "habitat": "Caribbean reef"},
    {"id": "tubbataha", "name": "Tubbataha Reefs", "region": "Philippines", "lat": 8.85, "lon": 119.92, "biomeKey": "coral", "habitat": "atoll reef"},
    {"id": "maldives", "name": "Maldives Atolls", "region": "Maldives", "lat": 3.2, "lon": 73.2, "biomeKey": "coral", "habitat": "coral atoll"},
    {"id": "hawaii-kona", "name": "Kona Coast", "region": "Hawaiʻi, USA", "lat": 19.6, "lon": -155.97, "biomeKey": "coral", "habitat": "volcanic coast reef"},
    {"id": "raja-ampat", "name": "Raja Ampat", "region": "Indonesia", "lat": -0.6, "lon": 130.5, "biomeKey": "coral", "habitat": "coral triangle"},
    {"id": "ningaloo", "name": "Ningaloo Reef", "region": "Western Australia", "lat": -22.7, "lon": 113.7, "biomeKey": "coral", "habitat": "fringing reef"},
    {"id": "iceland-vatnajokull", "name": "Vatnajökull Edge", "region": "Iceland", "lat": 64.4, "lon": -16.8, "biomeKey": "arctic", "habitat": "subarctic glacier margin"},
    {"id": "greenland-ilulissat", "name": "Ilulissat Icefjord", "region": "Greenland", "lat": 69.2, "lon": -51.1, "biomeKey": "arctic", "habitat": "arctic fjord"},
    {"id": "alaska-denali", "name": "Denali Foothills", "region": "Alaska, USA", "lat": 63.5, "lon": -150.5, "biomeKey": "arctic", "habitat": "subarctic tundra"},
    {"id": "lapland", "name": "Swedish Lapland", "region": "Sweden", "lat": 67.8, "lon": 20.2, "biomeKey": "arctic", "habitat": "arctic birch & tundra"},
    {"id": "chukotka", "name": "Chukotka Coast", "region": "Russia", "lat": 66.0, "lon": -171.0, "biomeKey": "arctic", "habitat": "Bering coastal tundra"},
    {"id": "falklands", "name": "Falkland Islands", "region": "South Atlantic", "lat": -51.7, "lon": -59.0, "biomeKey": "islands", "habitat": "subantarctic islands"},
    {"id": "south-georgia", "name": "South Georgia", "region": "South Atlantic", "lat": -54.3, "lon": -36.5, "biomeKey": "islands", "habitat": "subantarctic seabird colonies"},
    {"id": "iceland-reynisfjara", "name": "Reynisfjara Coast", "region": "Iceland", "lat": 63.4, "lon": -19.05, "biomeKey": "islands", "habitat": "north Atlantic coast"},
    {"id": "canary-islands", "name": "La Gomera", "region": "Spain", "lat": 28.1, "lon": -17.25, "biomeKey": "islands", "habitat": "Macaronesian laurel forest"},
    {"id": "azores", "name": "São Miguel", "region": "Portugal", "lat": 37.8, "lon": -25.5, "biomeKey": "islands", "habitat": "Azorean highland"},
    {"id": "madagascar-andohahela", "name": "Andohahela", "region": "Madagascar", "lat": -24.75, "lon": 46.7, "biomeKey": "rainforest", "habitat": "humid & dry forest ecotone"},
    {"id": "reunion", "name": "Réunion Highlands", "region": "France", "lat": -21.1, "lon": 55.5, "biomeKey": "islands", "habitat": "Indian Ocean highland forest"},
    {"id": "mauritius", "name": "Black River Gorges", "region": "Mauritius", "lat": -20.4, "lon": 57.4, "biomeKey": "islands", "habitat": "island remnant forest"},
    {"id": "seychelles", "name": "Vallée de Mai", "region": "Seychelles", "lat": -4.33, "lon": 55.74, "biomeKey": "islands", "habitat": "palm forest"},
    {"id": "new-caledonia", "name": "New Caledonia", "region": "France", "lat": -21.5, "lon": 165.5, "biomeKey": "islands", "habitat": "ultramafic scrub & forest"},
    {"id": "solomon-islands", "name": "Guadalcanal Forests", "region": "Solomon Islands", "lat": -9.6, "lon": 160.2, "biomeKey": "rainforest", "habitat": "Melanesian island rainforest"},
    {"id": "vanuatu", "name": "Efate Highlands", "region": "Vanuatu", "lat": -17.7, "lon": 168.3, "biomeKey": "islands", "habitat": "Pacific island forest"},
    {"id": "fiji-taveuni", "name": "Taveuni", "region": "Fiji", "lat": -16.8, "lon": -179.9, "biomeKey": "islands", "habitat": "Pacific rainforest"},
    {"id": "samoa", "name": "Upolu Highlands", "region": "Samoa", "lat": -13.9, "lon": -171.75, "biomeKey": "islands", "habitat": "Polynesian rainforest"},
    {"id": "costa-rica-osa", "name": "Osa Peninsula", "region": "Costa Rica", "lat": 8.55, "lon": -83.5, "biomeKey": "rainforest", "habitat": "Pacific lowland rainforest"},
    {"id": "choco", "name": "Chocó", "region": "Colombia", "lat": 5.7, "lon": -77.0, "biomeKey": "rainforest", "habitat": "Chocó wet forest"},
    {"id": "andes-cloud", "name": "Eastern Cordillera Cloud Forest", "region": "Colombia", "lat": 4.7, "lon": -74.0, "biomeKey": "rainforest", "habitat": "Andean cloud forest"},
    {"id": "iguazu", "name": "Iguazú", "region": "Argentina / Brazil", "lat": -25.7, "lon": -54.45, "biomeKey": "rainforest", "habitat": "subtropical waterfall forest"},
    {"id": "yucatan", "name": "Sian Ka'an", "region": "Mexico", "lat": 19.8, "lon": -87.6, "biomeKey": "wetlands", "habitat": "Caribbean coastal wetlands"},
    {"id": "california-channel", "name": "Channel Islands", "region": "California, USA", "lat": 34.0, "lon": -119.8, "biomeKey": "islands", "habitat": "Mediterranean island scrub"},
    {"id": "cape-fynbos", "name": "Cape Fynbos", "region": "South Africa", "lat": -34.0, "lon": 18.4, "biomeKey": "temperate", "habitat": "fynbos shrubland"},
    {"id": "mediterranean-corsica", "name": "Corsican Maquis", "region": "France", "lat": 42.15, "lon": 9.15, "biomeKey": "temperate", "habitat": "Mediterranean maquis"},
    {"id": "iberian-donana", "name": "Doñana", "region": "Spain", "lat": 37.0, "lon": -6.4, "biomeKey": "wetlands", "habitat": "Mediterranean wetlands"},
    {"id": "bialowieza", "name": "Białowieża Forest", "region": "Poland / Belarus", "lat": 52.7, "lon": 23.85, "biomeKey": "temperate", "habitat": "primeval lowland forest"},
    {"id": "carpathians", "name": "Carpathian Forest", "region": "Romania", "lat": 45.5, "lon": 24.5, "biomeKey": "temperate", "habitat": "montane beech forest"},
    {"id": "scotland-cairngorms", "name": "Cairngorms", "region": "Scotland, UK", "lat": 57.1, "lon": -3.7, "biomeKey": "temperate", "habitat": "boreal highland"},
    {"id": "ireland-burren", "name": "The Burren", "region": "Ireland", "lat": 53.1, "lon": -9.1, "biomeKey": "temperate", "habitat": "limestone pavement"},
    {"id": "japan-hokkaido", "name": "Kushiro Wetlands", "region": "Japan", "lat": 43.1, "lon": 144.4, "biomeKey": "wetlands", "habitat": "boreal wetlands"},
    {"id": "japan-yakushima", "name": "Yakushima", "region": "Japan", "lat": 30.35, "lon": 130.53, "biomeKey": "temperate", "habitat": "ancient cedar forest"},
    {"id": "korea-demilitarized", "name": "DMZ Wetlands", "region": "Korea", "lat": 38.0, "lon": 126.8, "biomeKey": "wetlands", "habitat": "temperate wetlands"},
    {"id": "taiwan-alishan", "name": "Alishan", "region": "Taiwan", "lat": 23.5, "lon": 120.8, "biomeKey": "temperate", "habitat": "montane cloud forest"},
    {"id": "philippines-luzon", "name": "Sierra Madre", "region": "Philippines", "lat": 16.0, "lon": 121.8, "biomeKey": "rainforest", "habitat": "Philippine rainforest"},
    {"id": "vietnam-cuc-phuong", "name": "Cúc Phương", "region": "Vietnam", "lat": 20.3, "lon": 105.6, "biomeKey": "rainforest", "habitat": "limestone rainforest"},
    {"id": "thailand-kaeng-krachan", "name": "Kaeng Krachan", "region": "Thailand", "lat": 12.8, "lon": 99.4, "biomeKey": "rainforest", "habitat": "Tenasserim rainforest"},
    {"id": "myanmar-alaungdaw", "name": "Alaungdaw Kathapa", "region": "Myanmar", "lat": 22.3, "lon": 94.4, "biomeKey": "rainforest", "habitat": "deciduous monsoon forest"},
    {"id": "bhutan", "name": "Jigme Dorji", "region": "Bhutan", "lat": 27.8, "lon": 89.5, "biomeKey": "temperate", "habitat": "Eastern Himalayan forest"},
    {"id": "kazakhstan-steppe", "name": "Kazakh Steppe", "region": "Kazakhstan", "lat": 48.5, "lon": 67.0, "biomeKey": "savanna", "habitat": "temperate grassland"},
    {"id": "mongolia-steppe", "name": "Mongolian Steppe", "region": "Mongolia", "lat": 47.0, "lon": 103.0, "biomeKey": "savanna", "habitat": "cold steppe"},
    {"id": "tibet-plateau", "name": "Qinghai Plateau", "region": "China", "lat": 34.5, "lon": 96.0, "biomeKey": "arctic", "habitat": "high plateau grassland"},
    {"id": "peru-paracas", "name": "Paracas", "region": "Peru", "lat": -13.85, "lon": -76.25, "biomeKey": "desert", "habitat": "coastal desert & seabird cliffs"},
    {"id": "chile-valdivian", "name": "Valdivian Forest", "region": "Chile", "lat": -40.0, "lon": -73.0, "biomeKey": "temperate", "habitat": "temperate rainforest"},
    {"id": "argentina-iberia", "name": "Iberá Wetlands", "region": "Argentina", "lat": -28.5, "lon": -57.2, "biomeKey": "wetlands", "habitat": "grassland wetlands"},
    {"id": "brazil-caatinga", "name": "Caatinga", "region": "Brazil", "lat": -8.5, "lon": -40.0, "biomeKey": "desert", "habitat": "dry scrub woodland"},
    {"id": "guyana-kanuku", "name": "Kanuku Mountains", "region": "Guyana", "lat": 3.2, "lon": -59.3, "biomeKey": "rainforest", "habitat": "Guiana Shield forest"},
    {"id": "suriname-central", "name": "Central Suriname", "region": "Suriname", "lat": 4.0, "lon": -56.5, "biomeKey": "rainforest", "habitat": "Guiana rainforest"},
    {"id": "gabon-lope", "name": "Lopé", "region": "Gabon", "lat": -0.5, "lon": 11.5, "biomeKey": "rainforest", "habitat": "forest-savanna mosaic"},
    {"id": "uganda-bwindi", "name": "Bwindi", "region": "Uganda", "lat": -1.05, "lon": 29.7, "biomeKey": "rainforest", "habitat": "afromontane forest"},
    {"id": "rwanda-nyungwe", "name": "Nyungwe", "region": "Rwanda", "lat": -2.5, "lon": 29.2, "biomeKey": "rainforest", "habitat": "montane rainforest"},
    {"id": "ethiopia-bale", "name": "Bale Mountains", "region": "Ethiopia", "lat": 6.8, "lon": 39.7, "biomeKey": "temperate", "habitat": "afroalpine highland"},
    {"id": "ghana-kakum", "name": "Kakum", "region": "Ghana", "lat": 5.35, "lon": -1.38, "biomeKey": "rainforest", "habitat": "West African rainforest"},
    {"id": "senegal-djoudj", "name": "Djoudj", "region": "Senegal", "lat": 16.35, "lon": -16.25, "biomeKey": "wetlands", "habitat": "Sahel wetlands"},
    {"id": "morocco-souss", "name": "Souss-Massa", "region": "Morocco", "lat": 30.1, "lon": -9.6, "biomeKey": "wetlands", "habitat": "Atlantic coastal wetlands"},
    {"id": "israel-hula", "name": "Hula Valley", "region": "Israel", "lat": 33.1, "lon": 35.6, "biomeKey": "wetlands", "habitat": "rift valley wetlands"},
    {"id": "jordan-azraq", "name": "Azraq Oasis", "region": "Jordan", "lat": 31.83, "lon": 36.82, "biomeKey": "wetlands", "habitat": "desert oasis wetlands"},
    {"id": "oman-dhofar", "name": "Dhofar Khareef", "region": "Oman", "lat": 17.0, "lon": 54.1, "biomeKey": "desert", "habitat": "monsoon desert woodlands"},
    {"id": "uae-mangroves", "name": "Abu Dhabi Mangroves", "region": "UAE", "lat": 24.45, "lon": 54.4, "biomeKey": "wetlands", "habitat": "arid-coast mangroves"},
    {"id": "iran-golestan", "name": "Golestan Forest", "region": "Iran", "lat": 37.3, "lon": 55.7, "biomeKey": "temperate", "habitat": "Hyrcanian forest"},
    {"id": "turkey-kackar", "name": "Kaçkar Mountains", "region": "Turkey", "lat": 40.85, "lon": 41.15, "biomeKey": "temperate", "habitat": "Pontic montane forest"},
    {"id": "greece-prespa", "name": "Prespa Lakes", "region": "Greece", "lat": 40.8, "lon": 21.1, "biomeKey": "wetlands", "habitat": "highland lakes"},
    {"id": "italy-circeo", "name": "Circeo", "region": "Italy", "lat": 41.25, "lon": 13.05, "biomeKey": "temperate", "habitat": "Mediterranean coastal forest"},
    {"id": "portugal-arrabida", "name": "Arrábida", "region": "Portugal", "lat": 38.48, "lon": -8.98, "biomeKey": "temperate", "habitat": "Mediterranean scrub"},
    {"id": "norway-hardangervidda", "name": "Hardangervidda", "region": "Norway", "lat": 60.1, "lon": 7.5, "biomeKey": "arctic", "habitat": "alpine plateau"},
    {"id": "canada-churchill", "name": "Churchill", "region": "Manitoba, Canada", "lat": 58.77, "lon": -94.17, "biomeKey": "arctic", "habitat": "Hudson Bay tundra"},
    {"id": "canada-haida", "name": "Haida Gwaii", "region": "British Columbia, Canada", "lat": 53.25, "lon": -132.1, "biomeKey": "temperate", "habitat": "coastal temperate rainforest"},
    {"id": "usa-acadia", "name": "Acadia", "region": "Maine, USA", "lat": 44.35, "lon": -68.2, "biomeKey": "temperate", "habitat": "rocky coastal forest"},
    {"id": "usa-boundary-waters", "name": "Boundary Waters", "region": "Minnesota, USA", "lat": 48.1, "lon": -91.0, "biomeKey": "temperate", "habitat": "boreal lake country"},
    {"id": "usa-big-bend", "name": "Big Bend", "region": "Texas, USA", "lat": 29.25, "lon": -103.25, "biomeKey": "desert", "habitat": "Chihuahuan canyonlands"},
    {"id": "usa-congaree", "name": "Congaree", "region": "South Carolina, USA", "lat": 33.79, "lon": -80.78, "biomeKey": "wetlands", "habitat": "bottomland hardwood forest"},
    {"id": "usa-redwoods", "name": "Redwood Coast", "region": "California, USA", "lat": 41.3, "lon": -124.0, "biomeKey": "temperate", "habitat": "coastal redwood forest"},
    {"id": "mexico-monarch", "name": "Monarch Butterfly Reserve", "region": "Mexico", "lat": 19.6, "lon": -100.25, "biomeKey": "temperate", "habitat": "oyamel fir forest"},
    {"id": "cuba-zapata", "name": "Zapata Swamp", "region": "Cuba", "lat": 22.3, "lon": -81.5, "biomeKey": "wetlands", "habitat": "Caribbean wetlands"},
    {"id": "jamaica-cockpit", "name": "Cockpit Country", "region": "Jamaica", "lat": 18.25, "lon": -77.6, "biomeKey": "rainforest", "habitat": "karst rainforest"},
    {"id": "dominican-los-haitises", "name": "Los Haitises", "region": "Dominican Republic", "lat": 19.05, "lon": -69.6, "biomeKey": "wetlands", "habitat": "karst mangrove estuary"},
    {"id": "trinidad-asasin", "name": "Asa Wright", "region": "Trinidad", "lat": 10.72, "lon": -61.3, "biomeKey": "rainforest", "habitat": "island rainforest"},
    {"id": "galapagos-isabela", "name": "Isabela Highlands", "region": "Galápagos, Ecuador", "lat": -0.85, "lon": -91.1, "biomeKey": "islands", "habitat": "volcanic highland scrub"},
    {"id": "antarctica-peninsula", "name": "Antarctic Peninsula", "region": "Antarctica", "lat": -64.8, "lon": -62.5, "biomeKey": "arctic", "habitat": "polar coast"},
    {"id": "kerguelen", "name": "Kerguelen Islands", "region": "French Southern Territories", "lat": -49.35, "lon": 69.5, "biomeKey": "islands", "habitat": "subantarctic islands"},
    {"id": "heard-island", "name": "Heard Island", "region": "Australia", "lat": -53.1, "lon": 73.5, "biomeKey": "islands", "habitat": "subantarctic volcanic island"},
    # Dense mid-latitude / urban-wild fringe for dropped-pin coverage
    {"id": "nyc-jamaica-bay", "name": "Jamaica Bay", "region": "New York, USA", "lat": 40.62, "lon": -73.83, "biomeKey": "wetlands", "habitat": "urban estuary"},
    {"id": "london-richmond", "name": "Richmond Park", "region": "United Kingdom", "lat": 51.44, "lon": -0.27, "biomeKey": "temperate", "habitat": "urban woodland park"},
    {"id": "paris-fontainebleau", "name": "Fontainebleau Forest", "region": "France", "lat": 48.4, "lon": 2.7, "biomeKey": "temperate", "habitat": "temperate forest"},
    {"id": "berlin-grunewald", "name": "Grunewald", "region": "Germany", "lat": 52.47, "lon": 13.23, "biomeKey": "temperate", "habitat": "urban forest"},
    {"id": "tokyo-meiji", "name": "Meiji Gaien Woods", "region": "Japan", "lat": 35.67, "lon": 139.72, "biomeKey": "temperate", "habitat": "urban woodland"},
    {"id": "sydney-royal", "name": "Royal National Park", "region": "Australia", "lat": -34.1, "lon": 151.06, "biomeKey": "temperate", "habitat": "coastal bushland"},
    {"id": "cape-town-table", "name": "Table Mountain", "region": "South Africa", "lat": -33.96, "lon": 18.4, "biomeKey": "temperate", "habitat": "fynbos mountain"},
    {"id": "rio-tijuca", "name": "Tijuca Forest", "region": "Brazil", "lat": -22.95, "lon": -43.28, "biomeKey": "rainforest", "habitat": "urban Atlantic forest"},
    {"id": "singapore-macritchie", "name": "MacRitchie", "region": "Singapore", "lat": 1.35, "lon": 103.82, "biomeKey": "rainforest", "habitat": "urban rainforest remnant"},
    {"id": "hongkong-mai-po", "name": "Mai Po", "region": "Hong Kong", "lat": 22.49, "lon": 114.04, "biomeKey": "wetlands", "habitat": "mangrove wetlands"},
]


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def http_get_json(url: str, timeout: float = 30.0) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def normalize_inat_observation(obs: dict, site: dict) -> dict | None:
    sounds = obs.get("sounds") or []
    if not sounds:
        return None
    sound = sounds[0]
    file_url = sound.get("file_url")
    license_code = (sound.get("license_code") or "").lower()
    if not file_url:
        return None
    # Prefer openly reusable; still keep cc-by-nc for prototype with attribution.
    if license_code and license_code not in {
        "cc0", "cc-by", "cc-by-sa", "cc-by-nc", "cc-by-nc-sa", "cc-by-nd", "cc-by-nc-nd"
    }:
        return None
    taxon = obs.get("taxon") or {}
    loc = obs.get("location") or ""
    lat = lon = None
    if loc and "," in loc:
        try:
            lat_s, lon_s = loc.split(",", 1)
            lat, lon = float(lat_s), float(lon_s)
        except ValueError:
            pass
    if lat is None and obs.get("geojson"):
        coords = obs["geojson"].get("coordinates") or []
        if len(coords) == 2:
            lon, lat = float(coords[0]), float(coords[1])
    if lat is None:
        lat, lon = site["lat"], site["lon"]
    return {
        "id": f"inat-{obs.get('id')}-{sound.get('id')}",
        "provider": "inaturalist",
        "providerId": str(obs.get("id")),
        "taxonCommon": taxon.get("preferred_common_name") or taxon.get("name") or "Wildlife sound",
        "taxonScientific": taxon.get("name") or "",
        "taxonId": taxon.get("id"),
        "lat": round(lat, 5),
        "lon": round(lon, 5),
        "fileUrl": file_url.split("?")[0],
        "license": license_code or "unknown",
        "attribution": sound.get("attribution") or obs.get("user", {}).get("login") or "iNaturalist observer",
        "sourceUrl": f"https://www.inaturalist.org/observations/{obs.get('id')}",
        "observedOn": obs.get("observed_on") or obs.get("time_observed_at") or "",
        "type": "species_call",
    }


def fetch_site_clips(site: dict, per_page: int = 8, radius_km: int = 120) -> list[dict]:
    params = {
        "lat": site["lat"],
        "lng": site["lon"],
        "radius": radius_km,
        "sounds": "true",
        "quality_grade": "research",
        "sound_license": "cc0,cc-by,cc-by-sa,cc-by-nc,cc-by-nc-sa",
        "per_page": per_page,
        "order_by": "votes",
        "order": "desc",
    }
    url = f"{INAT}?{urllib.parse.urlencode(params)}"
    try:
        data = http_get_json(url)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        print(f"  ! {site['id']}: {exc}")
        return []
    clips = []
    for obs in data.get("results") or []:
        clip = normalize_inat_observation(obs, site)
        if clip:
            clips.append(clip)
    # Widen search if sparse (oceans / remote)
    if len(clips) < 2 and radius_km < 400:
        time.sleep(0.35)
        return fetch_site_clips(site, per_page=per_page, radius_km=min(400, radius_km * 2))
    return clips


def main() -> None:
    print(f"Seeding {len(ECOSYSTEMS)} acoustic ecosystems…")
    ecosystems = []
    total_clips = 0
    for index, site in enumerate(ECOSYSTEMS, start=1):
        print(f"[{index}/{len(ECOSYSTEMS)}] {site['name']}")
        clips = fetch_site_clips(site)
        total_clips += len(clips)
        ecosystems.append({
            **site,
            "clipCount": len(clips),
            "clips": clips,
            "seededAt": time.strftime("%Y-%m-%d"),
            "providers": sorted({c["provider"] for c in clips}) or ["inaturalist"],
        })
        time.sleep(0.4)

    payload = {
        "version": 1,
        "product": "manticore-acoustic",
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "ecosystemCount": len(ecosystems),
        "clipCount": total_clips,
        "providers": ["inaturalist"],
        "licenseNote": "Per-clip Creative Commons licenses from iNaturalist observers. Retain attribution.",
        "ecosystems": ecosystems,
    }

    js = (
        "/* Auto-generated by scripts/seed_acoustic_ecosystems.py — do not edit by hand. */\n"
        "window.WILDATLAS_ACOUSTIC_DB = "
        + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        + ";\n"
    )
    OUT.write_text(js, encoding="utf-8")
    print(f"Wrote {OUT} ({len(ecosystems)} ecosystems, {total_clips} clips)")


if __name__ == "__main__":
    main()
