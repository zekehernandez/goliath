import k from "./kaboom";
import loadAssets from './loadAssets';
import "./scenes/index.js"; // initializes all scenes
import "./game.constants";

loadAssets();

k.go("title");
