const generateBtn = document.getElementById('generate-btn');
const resetBtn = document.getElementById('reset-btn');
const pokemonContainer = document.getElementById('pokemon-container');
let clickCount = 0;

const getRandomPokemon = async () => {
    const randomPokemonId = Math.floor(Math.random() * 1008) + 1; // Existem 1000 pokémons até o momento

    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
        const pokemon = response.data;
        return {
            name: pokemon.name,
            sprite: pokemon.sprites.front_default,
            types: pokemon.types.map(typeObj => typeObj.type.name),
            weight: pokemon.weight / 10, // Convertendo de hectogramas para quilogramas
            height: pokemon.height / 10, // Convertendo de decímetros para metros
        };
    } catch (error) {
        console.error(error);
        return null;
    }
};

const generateRandomTeam = async () => {
    if (clickCount > 0) {
        return;
    }

    clickCount++;
    generateBtn.disabled = true;
    resetBtn.disabled = false;
    pokemonContainer.innerHTML = ''; // Limpa o conteúdo anterior

    for (let i = 0; i < 6; i++) {
        const pokemon = await getRandomPokemon();
        if (pokemon) {
            const moves = await getRandomPokemonMoves(pokemon.name, 4);
            const pokemonDetails = await getPokemonDetails(pokemon.name);
            const pokemonEvolutions = await getPokemonEvolutions(pokemon.name);
            // const translatedTypes = await translateTypes(moves);
            // const translatedTypesString = await translatedTypes.join(', ');

            const evolutionInfo = pokemonEvolutions.map(evolution => `
                <div class="evolution-info">
                <h5>${capitalizeFirstLetter(evolution.name)}</h5>
                <img src="${evolution.image}" alt="${evolution.name}" class="img-fluid">
                <p>Level: ${evolution.level}</p>
                </div>
            `).join('');

            const pokemonInfo = `
                <div class="col-md-4">
                <div class="card-body pokemon-info border border-2 border-black border-opacity-25">
                    <h3>${capitalizeFirstLetter(pokemon.name)}</h3>
                    <img src="${pokemon.sprite}" alt="${pokemon.name}" class="img-fluid">
                    <p><strong>Nº Pokedéx:</strong> ${pokemonDetails.pokedexNumber}</p>
                    <p><strong>Região:</strong> ${pokemonDetails.region}</p>
                    <p><strong>Tipo:</strong> ${capitalizeFirstLetter(pokemon.types.join(', '))}</p>
                    <p><strong>Peso:</strong> ${pokemon.weight} kg</p>
                    <p><strong>Altura:</strong> ${pokemon.height} m</p>
                    <p>
                    <a class="btn btn-outline-dark" data-bs-toggle="collapse" href="#collapseExample${i}" role="button" aria-expanded="false" aria-controls="collapseExample${i}">
                        Detalhes
                    </a>
                    </p>
                    <div class="collapse" id="collapseExample${i}">
                    <div class="card card-body bg-warning bg-gradient bg-opacity-25 border border-2 border-black border-opacity-25">
                    <h5>Movimentos:</h5> 
                    <ul>
                    ${moves.map(move => `<li>${capitalizeFirstLetter(move)}</li>`).join('')}
                    </ul>
                    <h5>Evoluções:</h5>
                    ${evolutionInfo}
                    </div>
                    </div>
                </div>
                </div>
            `;

            pokemonContainer.innerHTML += pokemonInfo;

        }
    }
};



const resetGenerator = () => {
    clickCount = 0;
    generateBtn.disabled = false;
    resetBtn.disabled = true;
};

const getPokemonDetails = async (pokemonName) => {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
    const pokemon = response.data;

    const speciesResponse = await axios.get(pokemon.species.url);
    const species = speciesResponse.data;

    const pokedexNumber = species.id; // Número da Pokédex
    const generation = species.generation.name; // Região do Pokémon

    switch (generation) {
        case 'generation-i':
            region = 'Kanto'
            break;
        case 'generation-ii':
            region = 'Johto';
            break;
        case 'generation-iii':
            region = 'Hoenn';
            break;
        case 'generation-iv':
            region = 'Sinnoh';
            break;
        case 'generation-v':
            region = 'Unova';
            break;
        case 'generation-vi':
            region = 'Kalos';
            break;
        case 'generation-vii':
            region = 'Alola';
            break;
        case 'generation-viii':
            region = 'Galar';
            break;
        case 'generation-ix':
            region = 'Hisui';
            break;
    }

    return {
        name: pokemon.name,
        pokedexNumber,
        region,
    };
};

const getRandomPokemonMoves = async (pokemonName, count) => {
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const moves = response.data.moves;
        const randomMoves = [];

        for (let i = 0; i < count; i++) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)].move.name;
            randomMoves.push(randomMove);
        }

        return randomMoves;
    } catch (error) {
        console.error(error);
        return [];
    }
};

const getPokemonEvolutions = async (pokemonName) => {
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}/`);
        const evolutionChainURL = response.data.evolution_chain.url;

        const evolutionChainResponse = await axios.get(evolutionChainURL);
        const evolutionChain = evolutionChainResponse.data;

        const evolutionInfo = [];

        const addEvolutionInfo = (evolution) => {
            const name = evolution.species.name;
            const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolution.species.url.match(/\/(\d+)\//)[1]}.png`;
            const level = evolution.evolution_details[0].min_level;
            

            evolutionInfo.push({ name, image, level });

            if (evolution.evolves_to.length > 0) {
                addEvolutionInfo(evolution.evolves_to[0]);
            }
        };

        if (evolutionChain && evolutionChain.chain) {
            const basePokemon = evolutionChain.chain.species;
            const baseName = basePokemon.name;
            const baseImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${basePokemon.url.match(/\/(\d+)\//)[1]}.png`;
            const baseLevel = 1;

            evolutionInfo.push({ name: baseName, image: baseImage, level: baseLevel });

            if (evolutionChain.chain.evolves_to.length > 0) {
                addEvolutionInfo(evolutionChain.chain.evolves_to[0]);
            }
        }

        return evolutionInfo;
    } catch (error) {
        console.error(error);
        return [];
    }
};

// Passei o limite de usar essa API

// const translateTypes = async (types) => {
//     const text = types.join(', '); // Tipos de Pokémon a serem traduzidos, por exemplo, 'Fire, Flying'
//     const targetLanguage = 'pt'; // Defina o idioma de destino para a tradução, por exemplo, 'pt' para português

//     const encodedParams = new URLSearchParams();
//     encodedParams.set('q', text);
//     encodedParams.set('target', targetLanguage);
//     encodedParams.set('source', 'en');

//     const options = {
//         method: 'POST',
//         url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
//         headers: {
//           'content-type': 'application/x-www-form-urlencoded',
//           'Accept-Encoding': 'application/gzip',
//           'X-RapidAPI-Key': '1538330405msh104cc3ee69ecc46p102302jsn76d82d1fcac6',
//           'X-RapidAPI-Host': 'google-translate1.p.rapidapi.com'
//         },
//         data: encodedParams,
//       };
    
//   try {
//     const response = await axios.request(options);
//     const translatedTypes = response.data.data.translations.map(
//       (translation) => translation.translatedText
//     );
//     return translatedTypes;
//   } catch (error) {
//     console.error('Erro na tradução:', error);
//     return [];
//   }
// };

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const getPokemonByName = async (name) => {
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
      const pokemon = response.data;
      return pokemon;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  
  // Exemplo de uso
  const searchPokemon = async () => {
    const pokemonName = 'charizard';
    const pokemon = await getPokemonByName(pokemonName);
  
    if (pokemon) {
      console.log('Nome:', pokemon.name);
      console.log('Tipo:', pokemon.types.map((type) => type.type.name).join(', '));
      console.log('Habilidades:', pokemon.abilities.map((ability) => ability.ability.name).join(', '));
      console.log('Estatísticas:', pokemon.stats.map((stat) => `${stat.stat.name}: ${stat.base_stat}`).join(', '));
      // ... outros detalhes do Pokémon que você desejar exibir
    } else {
      console.log('Pokémon não encontrado!');
    }
  };
  
  searchPokemon();

