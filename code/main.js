import k from "./kaboom";
import "./scenes/index.js"; // initializes all scenes

// load assets
k.loadSprite("bean", "sprites/bean.png");
k.loadSprite("arrow", "sprites/arrow.png");

k.go("title");
