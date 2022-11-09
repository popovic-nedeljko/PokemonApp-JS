import * as model from './model.js';
import pokemonView from './views/pokemonView.js';
import resultsSearchView from './views/resultsSearchView.js';
import searchView from './views/searchView.js';
import viewAllPokemons from './views/viewAllPokemons.js';
import paginationView from './views/paginationView.js';
import yourPokemonView from './views/yourPokemonView.js';
import { MODAL_CLOSE_SEC } from './config.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime';

///////////////////////////////////////////////////////////////////////////////

const controlPokemons = async function () {
  try {
    const pokeUrl = window.location.hash.slice(1);
    if (!pokeUrl) return;

    //spinner
    pokemonView.renderSpinner();

    //loading pokemon
    await model.loadPokemon(pokeUrl);
    //loading pokelist
    await model.loadAllPokemons(model.getApiForPage(model.state.page));

    //render pokemon
    pokemonView.render(model.state);

    //update pokelist
    viewAllPokemons.update(model.state.search.pokeListResults);

    //render chached pokemon
    yourPokemonView.update(model.state.yourPokemons);

    //render pagination
    paginationView.render(model.state);
  } catch (err) {
    viewAllPokemons.render(model.state.search.pokeListResults);
    // pokemonView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    // render spinner
    resultsSearchView.renderSpinner();

    //get search pokemon name
    const pokeName = searchView.getPokeName();
    if (!pokeName) return controlLoadAllPokemons();

    // load serch results
    await model.loadSearchResults(pokeName);
    await model.loadAllPokemons(model.getApiForPage(model.state.page));

    // render results
    resultsSearchView._generateMarkupPreview(model.state.search.results);

    //render pagination
    paginationView.render(model.state);
  } catch (err) {
    console.error(err);
  }
};

const controlLoadAllPokemons = async function () {
  try {
    // render spinner
    resultsSearchView.renderSpinner();

    // load  results
    await model.loadAllPokemons(model.getApiForPage(model.state.page));

    //render results
    viewAllPokemons.render(model.state.search.pokeListResults);

    //render initial pagination btn
    paginationView.render(model.state);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = async function (goToPage) {
  //load new list
  await model.loadAllPokemons(model.getApiForPage(goToPage));

  //render new list results
  viewAllPokemons.render(model.state.search.pokeListResults);

  //render new pagination
  paginationView.render(model.state);
};

const controlCatchPokemon = async function () {
  //add & remove pokemon
  if (!model.state.pokemon.catched_pokemon) {
    model.addYourPokemon(model.state.pokemon);

    //open catch-pokemon winndow
    yourPokemonView.toggleWindow();
    //close catch-pokemon window
    setTimeout(function () {
      yourPokemonView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } else model.removeYourPokemon(model.state.pokemon.id);

  //update pokemon view
  pokemonView.render(model.state);

  //render your pokemon list
  yourPokemonView.render(model.state.yourPokemons);
};

const controlYourPokemon = function () {
  //render catched pokemon upon start of app
  yourPokemonView.render(model.state.yourPokemons);
};

//------------------initialization---------------------------------------

const init = function () {
  controlLoadAllPokemons();
  yourPokemonView.addHendlerRender(controlYourPokemon);
  pokemonView.addHandlerRender(controlPokemons);
  pokemonView.addHandlerNextPrevPokemon(controlPokemons);
  pokemonView.addHadnlerAddYourPokemon(controlCatchPokemon);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
};
init();
