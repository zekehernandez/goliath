import { UNITS } from '../constants';
import { COLORS } from '../utils';
import conversations from '../conversations';
import state from '../state';

const SPEAKERS = [
  '',
  'LT. STEEL',
  'DR. DRAUXBAHTZ',
  'LT. STEEL & DR. DRAUXBAHTZ IN UNISON',
]

export const addActiveText = (body, otherComps, textOptions) => {
  const width = textOptions.width ?? 30*UNITS

  add([
    text("", { ...textOptions, width }),
    "activeText",
    ...otherComps,
    {
      phase: 0,
      body,
    }
  ])
}

export const registerTextActions = () => {
  action("activeText", activeText => {
    if (activeText.phase === 0) {
      if (activeText.text.length < activeText.body.length) {
        // play("bump", { detune: rand(1, 10), volume: 0.25, loop:false })
      }
      activeText.text = activeText.text + activeText.body.charAt(activeText.text.length);
    }
  })
}

export const addConversation = (conversationKey, pause = 1, onEnd = () => {}, hideOverlay = false) => {
  console.log('conversationKey', conversationKey)

  if (state.pastConversations.has(conversationKey)) {
    onEnd && onEnd();
    return;
  } else {
    if (state.conversationQueue.length > 0) {
      state.conversationQueue.push({ conversationKey, pause, onEnd, hideOverlay });
      return;
    }
    
    state.pastConversations.add(conversationKey);
    state.conversationQueue.push({ conversationKey, pause, onEnd, hideOverlay });
  }

  state.isPaused = true;
  wait(pause, () => {
    const panelHeight = 4*UNITS
    const conversation = conversations[conversationKey];
    if (!conversation) {
      console.log('no conversation found for ', conversationKey);
      state.isPaused = false;
      return;
    }
    let index = 0;

    if (!hideOverlay) {
      add([
        "conversationOverlay",
        rect(32*UNITS, 18*UNITS),
        color(COLORS.BLACK),
        opacity(0.75),
        layer("ui"),
      ]);
    }

    const conversationPanel = add([
      "conversationPanel",
      rect(28*UNITS, panelHeight),
      pos(2*UNITS, 18*UNITS - panelHeight),
      outline(4, COLORS.LIGHT_BLUE),
      color(COLORS.DARK_BLUE),
      z(100),
      {
        index,
        needsToProgress: true,
      },
      layer('ui'),
    ]);


    const cta = add([
      "conversationCta",
      text("Click to progress", { size: 22 }),
      pos(conversationPanel.pos.add(conversationPanel.width - 1*UNITS, 3.5*UNITS)),
      color(COLORS.MED_BLUE),
      origin("right"),
      opacity(0),
      z(100),
    ]);

    conversationPanel.action(() => {
      if (conversationPanel.needsToProgress) {
        conversationPanel.needsToProgress = false;
        destroyAll("activeSpeaker");
        destroyAll("activeStatement")

        if (index >= conversation.length) {
          destroyAll("conversationOverlay");
          conversationPanel.destroy();
          cta.destroy();
          state.isPaused = false;
          onEnd && onEnd();
          // dequeue this convo then check for more
          state.conversationQueue.shift();
          if (state.conversationQueue.length > 0) {
            console.log("here?");
            const newConversation = state.conversationQueue.shift();
            
            addConversation(newConversation.conversationKey, newConversation.pause, newConversation.onEnd, newConversation.hideOverlay);
          }
          return;
        }

        const statement = conversation[index];

        const speakerName = add([
          "activeSpeaker",
          text(SPEAKERS[statement.speaker], { size: 28 }),
          pos(conversationPanel.pos.add(0.5*UNITS, 0.5*UNITS)),
          outline(1, COLORS.MED_BLUE),
          z(100),
          color(COLORS.LIGHT_BLUE),
          layer('ui'),
        ]);

        addActiveText(statement.text, 
          [
            "activeStatement",
            color(COLORS.MED_BLUE),
            pos(speakerName.pos.add(0, 1*UNITS)),
            layer('ui'),
            z(100),
          ],
          {
            size: 24,
            width: 26*UNITS,
          }
        );

        index++;
      }

      const activeStatement = get("activeStatement")[0];
      if (activeStatement && activeStatement.text.length === activeStatement.body.length) {
        wait(0.5, () => { cta.opacity = 1 });
      } else {
        cta.opacity = 0;
      }
    });
  });
  
  mouseClick(() => {
    const conversationPanels = get("conversationPanel");
    if (conversationPanels.length > 0) {
      conversationPanels[0].needsToProgress = true;
    }
  });
}