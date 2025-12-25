

// Copyright Johnathan Pennington | All rights reserved.


// Add to template page:
// <script src="/static/stapley/stapley.js"></script>


const settings = {
    'wait before peek secs': 0,  // min: 0; production: 12
    'peek secs': 4,  // 16
    'bounce screensaver': {
        'show paper layer': true,
        'skew paper layer': true,
        'filter background': true,
        'change filter on bounce': true,
    },
    'fly screensaver': {
        'show paper layer': true,
        'skew paper layer': true,
        'filter background': true,
    },
};
// const waitBeforeNextPeekSecs = 0;  // min: 0; production: 12
// const peekHoldSecs = 8;  // 16

// const scsvrBouncePaperLayerBool = true;
// const scsvrBounceBgSkewBool = true;
// const scsvrBounceBgFilterBool = true;
// const scsvrChangeFilterOnBounce = true;

// const scsvrAcrossPaperLayerBool = true;
// const scsvrAcrossBgSkewBool = true;
// const scsvrAcrossBgFilterBool = true;


// Add CSS.
const headElem = document.getElementsByTagName('head')[0];
const linkElem = document.createElement('link');
linkElem.rel = 'stylesheet';
linkElem.type = 'text/css';
linkElem.href = '/static/stapley/stapley.css';
headElem.appendChild(linkElem);


// Add HTML.
const stapleyBodyHtml = `
    <div id="stapley-background" style="display: none; " onclick="stapleyMinimize();" ></div>
    <div id="stapley-box" style="opacity: 0; " >
        <img class="stapley-body" alt="" src="/static/stapley/scsvr/body.png" onclick="stapleyOnClick();" />
        <img class="stapley-eyes" alt="" src="/static/stapley/scsvr/eyes.png" onclick="stapleyOnClick();" />
        <br />
        <div id="stapley-message" style="opacity: 0; " onclick="stapleyOnClick();">&nbsp;</div><!-- &nbsp there to init height for one line of text. -->
        <br />
        <div id="stapley-top-user-reply-box" class="stapley-user-reply-box" style="opacity: 0; XXXXXXdisplay: none; ">
            <button class="stapley-top-user-reply-button" onclick="stapleyContact()"><div class="stapley-button-box">Contact this person for a job opportunity</div></button>
            <button class="stapley-top-user-reply-button" onclick="stapleyJoke()"><div class="stapley-button-box">Tell me a joke</div></button>
            <a class="stapley-top-user-reply-button XXXXXXanchor-button-wrapper" href="/remove_stapley" target="_blank" XXXXXXonclick="stapleyRickRollButtonOnClick()" XXXXXXonclick="onClickThisDisplayNone(this)">
                <div class="stapley-button-box">Go away, Stapley</div>
            </a>
        </div>
        <div class="stapley-menu-box" style="display: none; ">
            <div id="stapley-minimize-box">
                <img id="stapley-minimize" alt="" src="/static/stapley/minimize.png" onclick="stapleyMinimize();" />
            </div>
            <div id="stapley-close-box">
                <img id="stapley-close" alt="" src="/static/stapley/close.png" onclick="stapleyOff();" />
            </div>
        </div>
    </div>
`;
const stapleyRootHtml = `
    <div id="scsvr-background" style="XXXXXXz-index: 102; XXXXXXopacity: 0; XXXXXXdisplay: none; "></div>
    <div id="scsvr-stapley-box" style="XXXXXXz-index: 103; XXXXXXopacity: 0; XXXXXXdisplay: none; ">
        <img class="stapley-body" alt="" src="/static/stapley/scsvr/body.png" />
        <img class="stapley-eyes" alt="" src="/static/stapley/scsvr/eyes.png" />
    </div>
`;
const stapleyHtmlElem = document.createElement('div');
stapleyHtmlElem.style.display = 'none';
stapleyHtmlElem.id = 'scsvr-container';
stapleyHtmlElem.innerHTML = stapleyRootHtml;
stapleyHtmlElem.addEventListener('click', () => {
    console.log('stapleyHtmlElem.addEventListener(click)');
    scsvrStop();
});
document.documentElement.append(stapleyHtmlElem);
document.body.innerHTML += stapleyBodyHtml;


// JAVASCRIPT





// FROM FARTHER::::

// // Doesn't handle escaped commas etc properly!!!!!!!
// function csvStrTo2dArray(csvStr) {
//     console.log(csvStr);
//     // Parse CSV.
//     const csvArray1d = csvStr.split('\n');
//     const csvArray2d = [];
//     for (const rowStr of csvArray1d) {
//         if (rowStr.length === 0) continue;  // Skip empty rows, especially commonly after last line.
//         const rowArray = rowStr.split(',');
//         let cellIndex = -1;
//         for (const cell of rowArray) {
//             cellIndex++;
//             if (cell.length > 1 && cell[0] === '"' && cell[cell.length - 1] === '"') {
//                 // Remove surrounding quotes.
//                 rowArray[cellIndex] = cell.slice(1, cell.length - 1);
//             };
//         };
//         csvArray2d.push(rowArray);
//     };
//     console.log(csvArray2d);
//     return csvArray2d;
// };

let jokes2dArray = [['When the fish ran into the wall, it said: ', '"Dam!"'], ];  // Init value in case data is needed before jokes.csv is fetched/parsed.

// // Requires XLSX package. Include in HTML head: <script src="https://unpkg.com/xlsx/dist/xlsx.full.min.js"></script>
// try { XLSX; } catch { handleErrorLoadingXlsxPackage(); };

// Requires XLSX package. Include in HTML head: <script src="https://unpkg.com/xlsx/dist/xlsx.full.min.js"></script>
loadLibrary('https://unpkg.com/xlsx/dist/xlsx.full.min.js', loadJokes);

function csvResponseStrTo2dArray(responseStr) {
    const workbook = XLSX.read(responseStr, {type: 'string', });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];  // First and only sheet.
    const array2d = XLSX.utils.sheet_to_json(sheet, {header: 1, });  // Header=1 creates a 2d array.
    array2d.shift();  // Remove header row.
    return array2d;
};









// MAIN STAPLEY

let stapleyOn = true;

const resizeThrottleMsecs = 500;//////.//////

// Message Animation Timing.
const fastCharMsecs = 26;  // 40
const slowCharMsecs = 200;  // 400
const punctuationCharsSet = new Set(['.', '!', '?', ',', ':', ';', ]);

// Blink Animation Timing.
const betweenBlinksMinSecs = 8;
const betweenBlinksMaxSecs = 12;
const stapleyEyesTransitionSecs = 0.08;
const stapleyEyesClosedMsecs = 70;
const openEyesTimeoutMsecs = stapleyEyesTransitionSecs * 1000 + stapleyEyesClosedMsecs;

// Peek Animation Timing.
const peekEnterSecs = 5;  // 5
const maxPeekStapleyBody = 0.4;
const peekExitSecs = 0.2;
    // Move comment below to setTimeout() calls.
    // Set timeout minimum 40msec found in testing for the initial stapleyPeek() call, 
    // otherwise stapley-box getBoundingClientRect() height property is 0 
    // and Stapley is positioned on screen before peek.
    // StapleyBoxElem.style.transformOrigin is dependent on stapley-body getBoundingClientRect().
const moveToAndFromCenterSecs = 0.7;  // 0.7
const peekExitTimeoutMsecs = (peekEnterSecs + settings['peek secs']) * 1000;
const nextPeekTimeoutMsecs = (peekExitSecs + settings['wait before peek secs']) * 1000;

// const stapleyWidthVw = 30;
// const stapleyAspectRatio = 291 / 288;  // width / height

let stapleyTimeoutId, stapleyMessageTimeoutId, stapleyRepositionTimeoutId, renderUserReplyButtonsTimeoutId;
let stapleyTransformOriginPxY, stapleyBoxWidthPx, stapleyBoxHeightPx, maxPeekStapleyBox;

const hideDuringScsvrElems = document.querySelectorAll('.stapley-scsvr-hide');
const stapleyBodyElem = document.querySelector('#stapley-box .stapley-body');
const stapleyEyesElems = document.querySelectorAll('.stapley-eyes');
const stapleyBoxElem = document.querySelector('#stapley-box');
const stapleyBackgroundElem = document.querySelector('#stapley-background');
const stapleyMenuBoxElem = document.querySelector('.stapley-menu-box');
const stapleyMessageElem = document.querySelector('#stapley-message');
const stapleyTopUserReplyBoxElem = document.querySelector('#stapley-top-user-reply-box');
// const userReplyBoxElems = document.querySelectorAll('.stapley-user-reply-box');
const stapleyPositionObj = {
    position: 'center',
    side: 0.5,
    peek: 1,
};

for (const elem of stapleyEyesElems) {
    elem.style.transition = `transform ${stapleyEyesTransitionSecs}s`;
};

stapleyOpenEyes();

const bodyRect = document.documentElement.getBoundingClientRect();
const bodyStyle = window.getComputedStyle(document.body, null);

const stapleyJokeElems = document.querySelectorAll('#stapley-jokes-list li');


// SCREENSAVER JAVASCRIPT

// Relies on eye blink code as well.

let scsvrStapleyBoxElemRect, scsvrStapleyBoxHypotenusePx, scsvrStapleyBoxSafeGapPxX, scsvrStapleyBoxSafeGapPxY, scsvrStapleyTimeoutId, scsvrStapleyRepositionTimeoutId, scsvrBgTimeoutId;

let scsvrRunningBool = false;

let scsvrBgCurrentHueTurnValue = 0;

const scsvrStapleyBoxElem = document.querySelector('#scsvr-stapley-box');
const scsvrStapleyBodyElem = document.querySelector('#scsvr-stapley-box .stapley-body');
const scsvrStapleyEyesElem = document.querySelector('#scsvr-stapley-box .stapley-eyes');
const scsvrStapleyEdgeOppositeKeyValue = {top: 'bottom', bottom: 'top', left: 'right', right: 'left', };
const scsvrStapleyCrossingSecs = 8;
const scsvrStapleyBeforeCrossingSecs = 4;
const scsvrStapleyMinRotateTurns = 0.15;  // 0.15
const scsvrStapleyMaxRotateTurns = 0.40;  // 0.40
const scsvrStapleyMinScale = 0.3;  // Max scale is 1.  // 0.2

// Bounce Screensaver
let scsvrStapleyBouncePosition;
const root2 = 1.4142;
const scsvrBounceGutterPercent = 6;  // 6  // The target percentage of the Stapley box dimensions that is off-screen during a bounce.
const scsvrStapleyBounceSecsPerStapleyHeight = 1;


const scsvrBgTransitionSecs = 15;
const scsvrBgMaxSkewDegs = 30;  // Min skew is maxSkewDegs * -1.
const scsvrBgOversizeRatio = 5;  // Background will be sized as this multiple of the viewport. When skewed, dimensions can be narrowed, so extra off-screen space is needed.
const scsvrBgTranslatePercent = 50 * (1 / scsvrBgOversizeRatio - 1);
const scsvrBgTranslateStr = `translate(${scsvrBgTranslatePercent}%, ${scsvrBgTranslatePercent}%)`;
const scsvrBgElem = document.querySelector('#scsvr-background');
// const scsvrBgColorElem = document.querySelector('#scsvr-background-colorXXXXXX');//////.//////
// const scsvrBgColorElem = document.body;

scsvrBgElem.style.top = 0;
scsvrBgElem.style.left = 0;
scsvrBgElem.style.width = `${window.innerWidth * scsvrBgOversizeRatio}px`;
scsvrBgElem.style.height = `${window.innerHeight * scsvrBgOversizeRatio}px`;
scsvrBgElem.style.backgroundSize = `auto ${100 / scsvrBgOversizeRatio}%`;
scsvrBgElem.style.transform = `${scsvrBgTranslateStr}`;

// scsvrStapleyBoxElem.style.display = 'flex';

scsvrStop();
window.addEventListener('resize', windowResizeEventListener);
////.////// COMMENT OUT FOR DEBUG ONLY!
window.addEventListener('blur', () => {
    stapleyClose(0);
    scsvrStop(false);
});
window.addEventListener('focus', stapleyReset);

//////.////// DEBUG ONLY!!!!!
window.addEventListener('keydown', (e) => {
    if (e.key === '0') scsvrStop();
    else if (e.key === '1') scsvrBounceStart();
    else if (e.key === '2') scsvrAcrossStart();
});

let windowResizeThrottleReopenTimeoutId, windowResizeScsvrStopTimeoutIdXXXXXX;
let windowResizeThrottleOpen = true;


function stapleyReset() {
    if (stapleyOn) {
        clearTimeout(stapleyTimeoutId);//////.//////
        stapleyTimeoutId = setTimeout(() => {
            resetStapleyForPeeking();
            refreshStapleyMeasurements();
        }, settings['wait before peek secs'] * 1000 + 40 + resizeThrottleMsecs);  // Minimum of 40 msecs and resizeThrottleMsecs to avoid bug.
    };
};

function stapleyOff() {
    stapleyOn = false;
    stapleyClose();
};

function stapleyClose(transitionOffscreenSecs=null) {
    // console.log('stapleyClose()');
    clearTimeout(stapleyTimeoutId);
    clearTimeout(stapleyMessageTimeoutId);
    if (transitionOffscreenSecs === null) transitionOffscreenSecs = moveToAndFromCenterSecs;
    stapleyMessageElem.style.opacity = 0;
    stapleyMenuBoxElem.style.display = 'none';
    stapleyBackgroundElem.style.display = 'none';
    // // stapleyBackgroundElem.style.transition = 'opacity 2s';
    // stapleyBackgroundElem.style.opacity = 0.3;
    stapleyPositionObj.peek = 0;
    stapleyPositionObj.position = 'bottom';
    stapleyPositionObj.side = 0.5;
    stapleyBoxElem.style.transition = `all ${transitionOffscreenSecs}s ease-in`;
    renderUserReplyButtons(0, 0);
    refreshStapleyMeasurements();
    // repositionStapley();
    repositionStapleyTimeout();
};

function stapleyMinimize(transitionOffscreenSecs=null, beforeNextPeekTimeoutSecs=null) {
    if (beforeNextPeekTimeoutSecs === null) {
        if (transitionOffscreenSecs === null) {
            transitionOffscreenSecs = moveToAndFromCenterSecs;
            beforeNextPeekTimeoutSecs = moveToAndFromCenterSecs + settings['wait before peek secs'];
        } else {
            beforeNextPeekTimeoutSecs = transitionOffscreenSecs + settings['wait before peek secs'];
        };
    };
    stapleyClose(transitionOffscreenSecs);
    if (stapleyOn) {
        clearTimeout(stapleyTimeoutId);//////.//////
        stapleyTimeoutId = setTimeout(() => {
            resetStapleyForPeeking();
        }, beforeNextPeekTimeoutSecs * 1000 + 40 + resizeThrottleMsecs);  // Minimum of 40 msecs and resizeThrottleMsecs to avoid bug.
    };
};

function resetStapleyForPeeking() {
    clearTimeout(stapleyTimeoutId);
    clearTimeout(stapleyMessageTimeoutId);
    stapleyMessageElem.innerHTML = '&nbsp;';  // &nbsp there to init height for one line of text.
    stapleyPeek();
};

function refreshStapleyMeasurements() {
    const stapleyBodyRect = stapleyBodyElem.getBoundingClientRect();
    const stapleyBoxRect = stapleyBoxElem.getBoundingClientRect();
    stapleyBoxWidthPx = stapleyBoxRect.width;  /////// used?  ////// TODO have global variable for stapleyBoxRect and stapleyBodyRect only, and call .width and .height on it instead of using these individual variables?????
    stapleyBoxHeightPx = stapleyBoxRect.height;  /////// used?
    stapleyBodyWidthPx = stapleyBodyRect.width;  /////// used?
    stapleyBodyHeightPx = stapleyBodyRect.height;  /////// used?
    stapleyTransformOriginPxY = stapleyBodyRect.height / 2;
    stapleyBoxElem.style.transformOrigin = `50% ${stapleyTransformOriginPxY}px`;  // horizontal vertical
    maxPeekStapleyBox = maxPeekStapleyBody * stapleyBodyHeightPx / stapleyBoxHeightPx;
};

function renderUserReplyButtons(timeoutMsecs=500, opacity=1) {
    clearTimeout(renderUserReplyButtonsTimeoutId);
    renderUserReplyButtonsTimeoutId = setTimeout(() => {
        // for (const elem of userReplyBoxElems) elem.style.opacity = 1;
        stapleyTopUserReplyBoxElem.style.opacity = opacity;
        // console.log('stapleyTopUserReplyBox.style.opacity:', stapleyTopUserReplyBox.style.opacity, 'opacity var:,', opacity)
    }, timeoutMsecs);
};

function stapleyTypingAnimationTimeout(messageStrLines, firstCharNotDisplayedIndex=1, finalMessageStrLines=null) {
    // FirstCharNotDisplayedIndex must be a positive integer.
    // Final messageStrLines controls the final html after animation. Html tags can be safely used here. If finalMessageStrLines is null (default), no final change is made.

    clearTimeout(stapleyMessageTimeoutId);

    let timeoutMsecs;

    const messageStr = messageStrLines.join('');

    let lineBreakIndex = 0;
    const lineBreakIndices = new Set();
    // const lineBreakSubstrings = [];  ////// TODO pass into renderStapleyMessageFrame to reduce looping.
    for (const messageLine of messageStrLines.slice(0, -1)) {
        lineBreakIndex += messageLine.length;
        lineBreakIndices.add(lineBreakIndex);
        // const brSubstringObj = {substring: '<br/>', insertIndex: lineBreakIndex, };
        // lineBreakSubstrings.push(brSubstringObj);
    };

    for (;;) {

        if (firstCharNotDisplayedIndex > messageStr.length) {
            // END.
            clearTimeout(stapleyMessageTimeoutId);
            if (finalMessageStrLines) renderStapleyMessageFrame(finalMessageStrLines);
            renderUserReplyButtons();
            return;
        };

        if (lineBreakIndices.has(firstCharNotDisplayedIndex - 1)) {
            // End of line break.
            timeoutMsecs = slowCharMsecs;
            break

        } else if (messageStr[firstCharNotDisplayedIndex - 1] === ' ') {
            // Previous character is a space.

            if (firstCharNotDisplayedIndex > 1 && punctuationCharsSet.has(messageStr[firstCharNotDisplayedIndex - 2])) {
                // Character before last is punctuation.
                timeoutMsecs = slowCharMsecs;
                break;

            } else {
                // Character before last is not punctuation.
                firstCharNotDisplayedIndex++;
                continue
            };
            
        } else {
            // Previous character is not a space.
            timeoutMsecs = fastCharMsecs;
            break;
        };
    };

    // abc,     def
    //  xxxxxxxxxxxx start
    //   xxxxxxxxxxx
    // abc,     def
    //    xxxxxxxxxx
    //     xxxxxxxxx
    // abc,     def
    //      xxxxxxxx delay
    //       xxxxxxx skip
    // abc,     def
    //        xxxxxx skip
    //         xxxxx skip
    // abc,     def
    //          xxxx skip
    //           xxx
    // abc,     def
    //            xx 
    //             x
    // abc,     def 
    //              x end

    // if i is length, END

    // if i is 1, START

    // if i-1 is space and i-2 is punc, PAUSE
    // else if i-1 is space, SKIP

    stapleyMessageTimeoutId = setTimeout(() => {
            renderStapleyMessageFrame(messageStrLines, messageStr, firstCharNotDisplayedIndex);
            stapleyTypingAnimationTimeout(messageStrLines, firstCharNotDisplayedIndex + 1, finalMessageStrLines)
        }, timeoutMsecs);
};

function renderStapleyMessageFrame(messageLines=null, messageStr=null, firstCharNotDisplayedIndex=-1) {
    // If messageLines is null (default), messageStr is set using stapleyMessageElem.innerHTML, all characters are displayed, and firstCharNotDisplayedIndex is ignored.
    // If messageStr is null (default), it is calculated automatically with messageLines.join('').
    // If firstCharNotDisplayedIndex is -1 (default), all characters are displayed.

    if (messageLines === null) {
        stapleyMessageElem.querySelector('span.stapley-hidden-text').classList.remove('stapley-hidden-text');
        messageLines = [stapleyMessageElem.innerHTML, ];
        firstCharNotDisplayedIndex = -1;
    };

    if (messageStr === null) messageStr = messageLines.join('');

    if (firstCharNotDisplayedIndex === -1) firstCharNotDisplayedIndex = messageStr.length;
    // if (lineBreakIndices === null) lineBreakIndices = [];

    // let elemInnerHtml = messageStr.slice(0, firstCharNotDisplayedIndex);
    // const openTag = '<span class="stapley-hidden-text">';
    // elemInnerHtml += openTag;
    // elemInnerHtml += messageStr.slice(firstCharNotDisplayedIndex);
    // elemInnerHtml += '</span>';

    const substrings = [];
    // for (const index of lineBreakIndices) {
    //     const brSubstringObj = {substring: '<br/>', insertIndex: index, };
    //     substrings.push(brSubstringObj);
    // };
    let lineBreakIndex = 0;
    for (const messageLine of messageLines.slice(0, -1)) {
        lineBreakIndex += messageLine.length;
        const brSubstringObj = {substring: '<br onclick="stapleyOnClick();" />', insertIndex: lineBreakIndex, };
        substrings.push(brSubstringObj);
    };

    const openTagSubstringObj = {substring: '<span class="stapley-hidden-text" onclick="stapleyOnClick();" >', insertIndex: firstCharNotDisplayedIndex, };
    const closeTagSubstringObj = {substring: '</span>', insertIndex: messageStr.length, };
    substrings.push(openTagSubstringObj, closeTagSubstringObj);

    const elemInnerHtml = insertSubstrings(messageStr, substrings);

    // for (const lineBreakIndex of lineBreakIndices) {
    //     if (lineBreakIndex < firstCharNotDisplayedIndex) {
    //         const substringsObj = {substr: substrIndex, };
    //         elemInnerHtml = insertSubstrings(mainStr, substringsObj);
    //         elemInnerHtml.insert('<br/>', lineBreakIndex);
    //     } else {
    //         elemInnerHtml.insert('<br/>', lineBreakIndex + openTag.length);
    //     };
    // };

    stapleyMessageElem.innerHTML = elemInnerHtml;
};

function stapleyMessage(messageStrLines, initDelaySecs, finalMessageStrLines=null) {

    clearTimeout(stapleyTimeoutId);
    clearTimeout(stapleyMessageTimeoutId);
    renderStapleyMessageFrame(messageStrLines, null, 0);
    refreshStapleyMeasurements();

    stapleyTimeoutId = setTimeout(() => {
        stapleyMenuBoxElem.style.display = 'flex';
        stapleyMessageElem.style.opacity = 1;
        stapleyTypingAnimationTimeout(messageStrLines, 1, finalMessageStrLines);
    }, initDelaySecs * 1000);
};

function stapleyOnClick() {

    clearTimeout(stapleyTimeoutId);
    clearTimeout(stapleyMessageTimeoutId);

    if (stapleyPositionObj.position === 'center') {
        renderStapleyMessageFrame();  // Complete message display.
        renderUserReplyButtons(0);
        return;
    };

    stapleyBackgroundElem.style.display = 'block';
    stapleyBoxElem.style.transition = `all ${moveToAndFromCenterSecs}s ease-in-out`;
    stapleyPositionObj.position = 'center';
    repositionStapleyTimeout();
    const stapleyTopMessageLines = [`Hi, I’m Stapley! `, `It looks like you’re interested in this profile. `, `Would you like help? `, ];
    stapleyMessage(stapleyTopMessageLines, moveToAndFromCenterSecs);
};

function getRandomStapleyJokeLines() {
    return randChoice(jokes2dArray);
    // const randJokeElem = randChoice(stapleyJokeElems);
    // const jokeLineElems = randJokeElem.querySelectorAll('p');
    // const jokeLines = [];
    // for (const jokeLineElem of jokeLineElems) {
    //     jokeLines.push(jokeLineElem.innerText);
    // };
    // return jokeLines;
};

function stapleyJoke() {
    const stapleyJokeLines = getRandomStapleyJokeLines();
    stapleyMessage(stapleyJokeLines, moveToAndFromCenterSecs);
};

function stapleyContact() {
    const emailAddress = 'elenne09@gmail.com';
    const messageLines = [`Ok, here's some contact info you may find useful:`, '', 'El Lenn', 'Seattle, Washington', ];
    const finalMessageLines = messageLines.slice();
    messageLines.push(emailAddress);
    finalMessageLines.push(`<a href="mailto:${emailAddress}">${emailAddress}</a>`);
    stapleyMessage(messageLines, moveToAndFromCenterSecs, finalMessageLines);
};

function stapleyPeek() {

    clearTimeout(stapleyTimeoutId);

    stapleyRandPosition();

    // console.log('Snap to hidden position before peek.');
    stapleyBoxElem.style.transition = 'none';
    stapleyBoxElem.style.opacity = 0;
    stapleyPositionObj.peek = 0;
    repositionStapleyTimeout(0, 1);

    stapleyTimeoutId = setTimeout(() => {

        // console.log('Move slowly to peek position.');
        stapleyBoxElem.style.transition = `all ${peekEnterSecs}s ease-out`;
        stapleyPositionObj.peek = maxPeekStapleyBox;
        repositionStapleyTimeout();

        stapleyTimeoutId = setTimeout(() => {

            // console.log('Move quickly back to hidden position after peek.');
            stapleyBoxElem.style.transition = `all ${peekExitSecs}s ease-in`;
            stapleyPositionObj.peek = 0;
            repositionStapleyTimeout(0, 0);

            stapleyTimeoutId = setTimeout(() => {
                // console.log('Trigger new peek.');
                stapleyPeek();
            }, nextPeekTimeoutMsecs + 40 + resizeThrottleMsecs);  // Wait before: Trigger new peek.  // Minimum of 40 msecs and resizeThrottleMsecs to avoid bug.
        }, peekExitTimeoutMsecs);  // Wait before: Move quickly back to hidden position after peek.
    }, 200);  // Wait before: Move slowly to peek position.  // If too brief, prerequisite positioning doesn't complete, causing a bug.
};

function stapleyRandPosition() {
    // const possPositionsSet = new Set(['top', ]);
    const possPositionsSet = new Set(['top', 'bottom', 'left', 'right', ]);
    possPositionsSet.delete(stapleyPositionObj.position);
    const randPosition = randChoice(Array.from(possPositionsSet));
    stapleyPositionObj.position = randPosition;
    stapleyPositionObj.side = Math.random();
};

function repositionStapley(scale0=false) {

    let xformScaleStr = '';
    if (scale0) xformScaleStr = 'scale(0) ';
    
    if (stapleyPositionObj.position === 'left' || stapleyPositionObj.position === 'right') {

        let rotateTurns;
        let xTranslatePx = stapleyTransformOriginPxY + stapleyBoxWidthPx / 2 - stapleyBoxHeightPx * stapleyPositionObj.peek;

        if (stapleyPositionObj.position === 'right') {
            stapleyBoxElem.style.right = '0px';
            stapleyBoxElem.style.left = 'auto';
            rotateTurns = '-0.25';

        } else {
            // // stapleyPositionObj.position === 'left'
            stapleyBoxElem.style.left = '0px';
            stapleyBoxElem.style.right = 'auto';
            rotateTurns = '0.25';
            // xTranslatePx = stapleyTransformOriginPxY + stapleyBoxWidthPx / 2 - stapleyBoxHeightPx * stapleyPositionObj.peek;
            xTranslatePx *= -1;
            // translateX(112px) rotate(0.25turn)
            // translateX=-240 peak=0, translateX=145 peak=1
        };

        // Set transform before retrieving stapleyRect, so that rotations don't swap width and height values.
        const yTranslatePx = stapleyBodyWidthPx / 2 - stapleyTransformOriginPxY;
        stapleyBoxElem.style.transform = `${xformScaleStr}translateY(${yTranslatePx}px) translateX(${xTranslatePx}px) rotate(${rotateTurns}turn)`;
        
        const stapleyWidthRatio = stapleyBodyWidthPx / window.innerHeight;
        const sidePosPercent = (1 - stapleyWidthRatio) * 100 * stapleyPositionObj.side;

        stapleyBoxElem.style.top = `${sidePosPercent}%`;
        stapleyBoxElem.style.bottom = 'auto';

    } else if (stapleyPositionObj.position === 'top' || stapleyPositionObj.position === 'bottom') {
        
        let transformStr;
        
        if (stapleyPositionObj.position === 'top') {
            stapleyBoxElem.style.top = '0px';
            stapleyBoxElem.style.bottom = 'auto';
            const yTranslatePx = stapleyBoxHeightPx * stapleyPositionObj.peek - stapleyTransformOriginPxY * 2;
            transformStr = `translateY(${yTranslatePx}px) rotate(0.5turn)`;

        } else {
            // stapleyPositionObj.position === 'bottom'
            stapleyBoxElem.style.bottom = '0px';
            stapleyBoxElem.style.top = 'auto';
            const yTranslatePx = stapleyBoxHeightPx * (1 - stapleyPositionObj.peek);
            transformStr = `translateY(${yTranslatePx}px) rotate(0turn)`;
        };

        // Set transform before retrieving stapleyRect, so that rotations don't swap width and height values.
        stapleyBoxElem.style.transform = `${xformScaleStr}${transformStr}`;
        
        const minSidePos = (stapleyBoxWidthPx - stapleyBodyWidthPx) / (-2 * window.innerWidth);
        const maxSidePos = 1 - minSidePos - stapleyBoxWidthPx / window.innerWidth;
        const sidePos = (maxSidePos - minSidePos) * stapleyPositionObj.side + minSidePos;

        stapleyBoxElem.style.left = `${sidePos * 100}%`;
        stapleyBoxElem.style.right = `auto`;


    } else {
        // stapleyPositionObj.position === 'center'

        let transformStr = xformScaleStr;

        if (stapleyBoxElem.style.bottom === 'auto') {
            stapleyBoxElem.style.top = `50%`;
            transformStr += 'translateY(-50%)';
        } else {
            stapleyBoxElem.style.top = 'auto';
            stapleyBoxElem.style.bottom = '50%';
            transformStr += 'translateY(50%)';
        };

        if (stapleyBoxElem.style.right === 'auto') {
            stapleyBoxElem.style.left = `50%`;
            transformStr += ' translateX(-50%)';
        } else {
            stapleyBoxElem.style.left = 'auto';
            stapleyBoxElem.style.right = '50%';
            transformStr += ' translateX(50%)';
        };

        transformStr += ' rotate(0)';

        stapleyBoxElem.style.transform = transformStr;
    };
};

function repositionStapleyTimeout(timeoutMsecs=0, endOpacity=null) {
    // 0 <= endOpacity <= 1. If endOpacity is null (default), no change to opacity is made.
    clearTimeout(stapleyRepositionTimeoutId);
    stapleyRepositionTimeoutId = setTimeout(() => { 
        repositionStapley(); 
        if (endOpacity !== null) stapleyBoxElem.style.opacity = endOpacity;
    }, timeoutMsecs);
};

function stapleyOpenEyes() {

    for (const elem of stapleyEyesElems) {
        elem.style.transform = 'scaleY(1)';
    };
    // stapleyEyesElems.style.transform = 'scaleY(1)';

    const shutEyesTimeoutMsecs = randInt(betweenBlinksMinSecs * 1000, betweenBlinksMaxSecs * 1000) + stapleyEyesTransitionSecs * 1000;
    
    setTimeout(stapleyShutEyes, shutEyesTimeoutMsecs);
};

function stapleyShutEyes() {
    for (const elem of stapleyEyesElems) elem.style.transform = 'scaleY(0)';
    setTimeout(stapleyOpenEyes, openEyesTimeoutMsecs);
};

function windowResizeEventListener() {
    if (windowResizeThrottleOpen) {
        windowResizeThrottleOpen = false;
        stapleyMinimize(0, null);  // Clears timeout ids: stapleyTimeoutId, stapleyMessageTimeoutId, stapleyRepositionTimeoutId
        scsvrStop();  // Clears timeout ids: scsvrStapleyTimeoutId, scsvrStapleyRepositionTimeoutId, scsvrBgTimeoutId
                      // Not cleared timeout ids: stapleyTimeoutId, stapleyMessageTimeoutId, stapleyRepositionTimeoutId
        clearTimeout(windowResizeThrottleReopenTimeoutId);
        windowResizeThrottleReopenTimeoutId = setTimeout(() => {
            stapleyMinimize(0, null);  // Clears timeout ids: stapleyTimeoutId, stapleyMessageTimeoutId, stapleyRepositionTimeoutId
            scsvrStop();  // Clears timeout ids: scsvrStapleyTimeoutId, scsvrStapleyRepositionTimeoutId, scsvrBgTimeoutId
                          // Not cleared timeout ids: stapleyTimeoutId, stapleyMessageTimeoutId, stapleyRepositionTimeoutId
            windowResizeThrottleOpen = true;
        }, resizeThrottleMsecs);
    };
};

function closeResizeThrottle() {
    clearTimeout(scsvrStapleyTimeoutId); 
    clearTimeout(scsvrStapleyRepositionTimeoutId); 
    clearTimeout(scsvrBgTimeoutId); 
    clearTimeout(stapleyTimeoutId); 
    clearTimeout(stapleyMessageTimeoutId); 
    clearTimeout(stapleyRepositionTimeoutId);
    scsvrStop();
};

function scsvrBgTransformLoop(randFilterBool=false, randSkewBool=true, transitionFilterBool=true) {
    scsvrBgRandChange(randFilterBool, randSkewBool, transitionFilterBool);
    clearTimeout(scsvrBgTimeoutId);
    scsvrBgTimeoutId = setTimeout(() => {
        scsvrBgTransformLoop(randFilterBool, randSkewBool, transitionFilterBool);
    }, scsvrBgTransitionSecs * 1000);
};

function scsvrBgRandChange(randFilterBool=false, randSkewBool=true, transitionFilterBool=true) {

    const transProp = transitionFilterBool ? 'all' : 'transform';
    const transition = `${transProp} ${scsvrBgTransitionSecs}s ease-in-out`;
    scsvrBgElem.style.transition = transition;

    if (randSkewBool) {
        const randSkewDegsX = randInt(-scsvrBgMaxSkewDegs, scsvrBgMaxSkewDegs);
        const randSkewDegsY = randInt(-scsvrBgMaxSkewDegs, scsvrBgMaxSkewDegs);
        scsvrBgElem.style.transform = `${scsvrBgTranslateStr} skew(${randSkewDegsX}deg, ${randSkewDegsY}deg)`;
    };

    if (randFilterBool) {
        // scsvrBgCurrentHueTurnValue += randFloat(-0.15, 0.15);
        // const saturatePercent = randInt(0, 200);
        // const filter = `saturate(${saturatePercent}%) hue-rotate(${scsvrBgCurrentHueTurnValue.toFixed(2)}turn)`;
        document.documentElement.style.transition = transition;//////.////// doesn't change?????
        // scsvrBgColorElem.style.filter = filter;
        // scsvrBgElem.style.filter = filter;
        scsvrRandBgFilter();
    };
};

function scsvrRandBgFilter(transitionFilterBoolXXXXXX=true) {
    // const transProp = transitionFilterBool ? 'all' : 'transform';
    // const transition = `${transProp} ${scsvrBgTransitionSecs}s ease-in-out`;
    scsvrBgCurrentHueTurnValue += randFloat(-0.15, 0.15);
    const saturatePercent = randInt(0, 200);
    const filter = `saturate(${saturatePercent}%) hue-rotate(${scsvrBgCurrentHueTurnValue.toFixed(2)}turn)`;
    // scsvrBgColorElem.style.transition = transition;//////.////// doesn't change?????
    // document.body.style.filter = filter;
    // document.body.style.backdropFilter = filter;
    document.documentElement.style.filter = filter;
    document.documentElement.style.backdropFilter = filter;
    scsvrBgElem.style.filter = filter;
};

function scsvrStop(resetStapleyForPeeking=true, hideScsvrBg=false) {

    clearTimeout(scsvrStapleyTimeoutId);
    clearTimeout(scsvrStapleyRepositionTimeoutId);
    clearTimeout(scsvrBgTimeoutId);

    scsvrRunningBool = false;

    if (resetStapleyForPeeking) stapleyReset();

    scsvrBgElem.style.transform = scsvrBgTranslateStr;

    document.documentElement.style.backdropFilter = 'none';
    document.documentElement.style.filter = 'none';
    scsvrBgElem.style.filter = 'none';
    document.documentElement.style.transition = 'none';
    scsvrBgElem.style.transition = 'none';

    scsvrBgElem.style.opacity = 0;

    for (const elem of hideDuringScsvrElems) elem.style.opacity = 1;
    // scsvrBgElem.style.display = 'none';

    // if (hideScsvrBg) scsvrBgColorElem.style.display = 'none';//////.//////

    scsvrStapleyBoxElem.style.transition = 'none';
    scsvrStapleyBoxElem.style.transform = 'translateY(-100%)';
    scsvrStapleyBoxElem.style.top = 0;
    scsvrStapleyBoxElem.style.left = 0;
    scsvrStapleyBoxElem.style.right = 'auto';
    scsvrStapleyBoxElem.style.bottom = 'auto';
    // scsvrStapleyBoxElem.style.opacity = 0;

    scsvrStapleyBodyElem.setAttribute('src', '/static/stapley/scsvr/body.png');
    scsvrStapleyEyesElem.setAttribute('src', '/static/stapley/scsvr/eyes.png');

    document.querySelector('#scsvr-container').style.display = 'none';
};

function scsvrBounceStart() {

    // console.log('bounce start')

    if (scsvrRunningBool) return;
    scsvrRunningBool = true;

    clearTimeout(scsvrBgTimeoutId);
    clearTimeout(scsvrStapleyTimeoutId);
    clearTimeout(scsvrStapleyRepositionTimeoutId);

    stapleyClose(0);

    console.log("stapleyHtmlElem.style.display = 'flex';");
    document.querySelector('#scsvr-container').style.display = 'flex';
    // stapleyHtmlElem.style.display = 'flex';
    
    for (const elem of hideDuringScsvrElems) elem.style.opacity = 0;
    if (settings['bounce screensaver']['show paper layer']) scsvrBgElem.style.opacity = 1;  // Html is initialized at opacity=0;
    // scsvrBgElem.style.display = 'flex';
    // scsvrBgColorElem.style.display = 'flex';//////.//////

    // scsvrStapleyBoxElem.style.opacity = 1;
    scsvrStapleyBoxElem.style.transform = 'none';
    scsvrStapleyBouncePosition = {transitionSecs: 1, secsBeforeBounce: 1, endTransitionX: 550, endTransitionY: 0, afterBounceDirX: -1, afterBounceDirY: 1, };

    scsvrStapleyUpdateSizing();
    scsvrStapleyBounceRandStart();
    scsvrStapleyMoveToNewBounce();
    const skewBool = settings['bounce screensaver']['show paper layer'] && settings['bounce screensaver']['skew paper layer'];
    const bgTransformFilterBool = settings['bounce screensaver']['filter background'] && !settings['bounce screensaver']['change filter on bounce'];
    scsvrBgTimeoutId = setTimeout(() => { scsvrBgTransformLoop(bgTransformFilterBool, skewBool, bgTransformFilterBool); }, 200);
};

function scsvrStapleyBounceRandStart() {
    const marginPx = 10;
    // const startPxLeft = randInt(marginPx, window.innerWidth - marginPx - scsvrStapleyBoxElemRect.width);
    // const startPxTop = randInt(marginPx, window.innerHeight - marginPx - scsvrStapleyBoxElemRect.height);
    const startPxLeft = (window.innerWidth - scsvrStapleyBoxElemRect.width) / 2;
    const startPxTop = (window.innerHeight - scsvrStapleyBoxElemRect.height) / 2;
    const randFloat = Math.random();
    if (randFloat < 0.5) scsvrStapleyBouncePosition.afterBounceDirX = 1;
    else scsvrStapleyBouncePosition.afterBounceDirX = -1;
    if (0.25 <= randFloat && randFloat < 0.75) scsvrStapleyBouncePosition.afterBounceDirY = 1;
    else scsvrStapleyBouncePosition.afterBounceDirY = -1;

    // scsvrStapleyBouncePosition.afterBounceDirY = -1;
    scsvrStapleyBoxElem.style.left = `${startPxLeft}px`;
    scsvrStapleyBoxElem.style.top = `${startPxTop}px`;
};

function scsvrAcrossStart() {

    if (scsvrRunningBool) return;
    scsvrRunningBool = true;

    clearTimeout(scsvrBgTimeoutId);
    clearTimeout(scsvrStapleyTimeoutId);
    clearTimeout(scsvrStapleyRepositionTimeoutId);

    stapleyClose(0);
    
    for (const elem of hideDuringScsvrElems) elem.style.opacity = 0;
    if (settings['fly screensaver']['show paper layer']) scsvrBgElem.style.opacity = 1;  // Html is initialized at opacity=0;
    // scsvrBgElem.style.display = 'flex';
    // scsvrBgColorElem.style.display = 'flex';//////.//////
    document.querySelector('#scsvr-container').style.display = 'flex';

    scsvrBgElem.style.transition = `all ${scsvrBgTransitionSecs}s ease-in-out`;
    
    scsvrStapleyUpdateSizing();
    scsvrStapleyRandCrossing();
    const skewBool = settings['fly screensaver']['show paper layer'] && settings['fly screensaver']['skew paper layer'];
    scsvrBgTimeoutId = setTimeout(() => { scsvrBgTransformLoop(settings['fly screensaver']['filter background'], skewBool, true); }, 200);
};

function scsvrStapleyUpdateSizing() {
    // Need timeout before first run to allow scsvrStapleyBoxElem to load in DOM for scsvrStapleyBoxElemRect to register a rendered height.
    scsvrStapleyBoxElemRect = scsvrStapleyBoxElem.getBoundingClientRect();
    scsvrStapleyBoxHypotenusePx = Math.sqrt(scsvrStapleyBoxElemRect.width ** 2 + scsvrStapleyBoxElemRect.height ** 2);
    scsvrStapleyBoxSafeGapPxX = scsvrStapleyBoxHypotenusePx - scsvrStapleyBoxElemRect.width;
    scsvrStapleyBoxSafeGapPxY = scsvrStapleyBoxHypotenusePx - scsvrStapleyBoxElemRect.height;
};

function scsvrStapleyGetRandEndRotationTurns(startRotationTurns) {
    let randTurnChange = randFloat(scsvrStapleyMinRotateTurns, scsvrStapleyMaxRotateTurns);
    if (Math.random() < 0.5) randTurnChange *= -1;
    const endRotationTurns = startRotationTurns + randTurnChange;
    return endRotationTurns;
};

// setTimeout(() => {
//     scsvrBounceStart();
// }, 1000);  // Need time to get bounding client rect.
function calcNextBouncePosition() {
    // Right movement: afterBounceDirX === 1
    // Left movement: afterBounceDirX === -1
    // Down movement: afterBounceDirY === 1
    // Up movement: afterBounceDirY === -1

//     console.log(`%%%%%%%%%%%%%%%%%%%%%%%
// *****************
// $$$$$$$$$$$$$$$$$$$`)

    let boundX, boundY, newAfterBounceDirX, newAfterBounceDirY;
    scsvrStapleyBoxElemRect = scsvrStapleyBoxElem.getBoundingClientRect();

    const XXXXXXgutterPxX = scsvrStapleyBoxElemRect.width * scsvrBounceGutterPercent / 100;
    const XXXXXXgutterPxY = scsvrStapleyBoxElemRect.height * scsvrBounceGutterPercent / 100;
    if (scsvrStapleyBouncePosition.afterBounceDirX > 0) boundX = window.innerWidth - scsvrStapleyBoxElemRect.width + XXXXXXgutterPxX;
    else boundX = -XXXXXXgutterPxX;
    if (scsvrStapleyBouncePosition.afterBounceDirY > 0) boundY = window.innerHeight - scsvrStapleyBoxElemRect.height + XXXXXXgutterPxY;
    else boundY = -XXXXXXgutterPxY;

    // const maxDeltaX = (boundX - scsvrStapleyBoxElemRect.x) * scsvrStapleyBouncePosition.afterBounceDirX;
    // const maxDeltaY = (boundY - scsvrStapleyBoxElemRect.y) * scsvrStapleyBouncePosition.afterBounceDirY;
    const maxDeltaX = Math.abs(boundX - scsvrStapleyBoxElemRect.x);
    const maxDeltaY = Math.abs(boundY - scsvrStapleyBoxElemRect.y);
    const speed =  scsvrStapleyBounceSecsPerStapleyHeight / scsvrStapleyBoxElemRect.height;

    if (maxDeltaX >= maxDeltaY) {
        // Top/bottom bounce

        // console.log('BOUNCE TOP BOTTOM');

        const extraTransitionDist = scsvrStapleyBoxElemRect.height - XXXXXXgutterPxY;
        const bounceY = boundY;//////*////// Combine?
        const bounceX = scsvrStapleyBoxElemRect.x + maxDeltaY * scsvrStapleyBouncePosition.afterBounceDirX;//////*////// Combine?
        const distToBounceTargetPx = root2 * maxDeltaY;//////*////// Combine?
        const distToTransitionEndPx = root2 * (maxDeltaY + extraTransitionDist);//////*////// Combine?
        scsvrStapleyBouncePosition.endTransitionY = bounceY + extraTransitionDist * scsvrStapleyBouncePosition.afterBounceDirY;
        scsvrStapleyBouncePosition.endTransitionX = bounceX + extraTransitionDist * scsvrStapleyBouncePosition.afterBounceDirX;
        scsvrStapleyBouncePosition.transitionSecs = distToTransitionEndPx * speed;
        scsvrStapleyBouncePosition.secsBeforeBounce = distToBounceTargetPx * speed;

        // console.log('bounce:', bounceX, bounceY)

        if (scsvrStapleyBouncePosition.afterBounceDirY > 0) {
            // Bottom bounce
            // console.log('BOUNCE BOTTOM');
            newAfterBounceDirY = -1;  // Change direction toward up after bounce.
        } else {
            // Top bounce
            // console.log('BOUNCE TOP');
            newAfterBounceDirY = 1;  // Change direction toward down after bounce.
        };
    };
    if (maxDeltaX <= maxDeltaY) {
        // Left/right bounce

        // console.log('BOUNCE LEFT RIGHT');

        const extraTransitionDist = scsvrStapleyBoxElemRect.width - XXXXXXgutterPxX;
        const bounceX = boundX;//////*////// Combine?
        const bounceY = scsvrStapleyBoxElemRect.y + maxDeltaX * scsvrStapleyBouncePosition.afterBounceDirY;//////*////// Combine?
        const distToBounceTargetPx = root2 * maxDeltaX;//////*////// Combine?
        const distToTransitionEndPx = root2 * (maxDeltaX + extraTransitionDist);//////*////// Combine?
        scsvrStapleyBouncePosition.endTransitionY = bounceY + extraTransitionDist * scsvrStapleyBouncePosition.afterBounceDirY;
        scsvrStapleyBouncePosition.endTransitionX = bounceX + extraTransitionDist * scsvrStapleyBouncePosition.afterBounceDirX;
        scsvrStapleyBouncePosition.transitionSecs = distToTransitionEndPx * speed;
        scsvrStapleyBouncePosition.secsBeforeBounce = distToBounceTargetPx * speed;

        // console.log('bounce:', bounceX, bounceY)
        // console.log('bounceY = scsvrStapleyBoxElemRect.y + maxDeltaX * scsvrStapleyBouncePosition.afterBounceDirY')
        // console.log(bounceY, scsvrStapleyBoxElemRect.y, maxDeltaX, scsvrStapleyBouncePosition.afterBounceDirY)

        // scsvrStapleyBouncePosition.endTransitionX = boundX;
        // if (maxDeltaX !== maxDeltaY) scsvrStapleyBouncePosition.endTransitionY = scsvrStapleyBoxElemRect.y + maxDeltaX * scsvrStapleyBouncePosition.afterBounceDirY
        // const distToBounceTargetPx = root2 * (maxDeltaX - XXXXXXgutterPxX / 2);  // Subtracting half of gutter to calculate secsBeforeBounce.
        // const distToTransitionEndPx = root2 * maxDeltaX;  // CSS transition secs calculated to the maximum end transition point through gutter to result in a consistent speed.
        // console.log('distToTransitionEndPx = root2 * maxDeltaX')
        // console.log(distToTransitionEndPx, root2, maxDeltaX)
        // scsvrStapleyBouncePosition.secsBeforeBounce = scsvrStapleyBounceSecsPerVh * distToBounceTargetPx / window.innerHeight;
        // scsvrStapleyBouncePosition.transitionSecs = scsvrStapleyBounceSecsPerVh * distToTransitionEndPx / window.innerHeight;
        // console.log('scsvrStapleyBouncePosition.transitionSecs = scsvrStapleyBounceSecsPerVh * distToTransitionEndPx / window.innerWidth');
        // console.log(scsvrStapleyBouncePosition.transitionSecs, scsvrStapleyBounceSecsPerVh, distToTransitionEndPx, window.innerWidth);
        if (scsvrStapleyBouncePosition.afterBounceDirX > 0) {
            // Right bounce
            // console.log('BOUNCE RIGHT');
            newAfterBounceDirX = -1;  // Change direction toward the left after bounce.
        } else {
            // Left bounce
            // console.log('BOUNCE LEFT');
            newAfterBounceDirX = 1;  // Change direction toward the right after bounce.
        };
    };
    // If deltaX === deltaY, this is a corner bounce, and both if-blocks above will run.

    // Change direction of motion.
    if (typeof newAfterBounceDirX !== 'undefined') scsvrStapleyBouncePosition.afterBounceDirX = newAfterBounceDirX;
    if (typeof newAfterBounceDirY !== 'undefined') scsvrStapleyBouncePosition.afterBounceDirY = newAfterBounceDirY;

    ////// DEBUG ONLY!
    const distToTransEnd = Math.sqrt(
        (scsvrStapleyBoxElemRect.x - scsvrStapleyBouncePosition.endTransitionX) ** 2 
        + (scsvrStapleyBoxElemRect.y - scsvrStapleyBouncePosition.endTransitionY) ** 2
    );

    // console.log('^^^^^^^^^^^^^')
    // console.log('window:', window.innerWidth, window.innerHeight)
    // console.log('distToTransEnd = Math.sqrt((scsvrStapleyBoxElemRect.x - scsvrStapleyBouncePosition.endTransitionX) ** 2 + (scsvrStapleyBoxElemRect.y - scsvrStapleyBouncePosition.endTransitionY) ** 2')
    // console.log(distToTransEnd, scsvrStapleyBoxElemRect.x, scsvrStapleyBouncePosition.endTransitionX, scsvrStapleyBoxElemRect.y, scsvrStapleyBouncePosition.endTransitionY)
    // const toTransEndPxPerSec = distToTransEnd / scsvrStapleyBouncePosition.transitionSecs;
    // console.log('toTransEndPxPerSec = distToTransEnd / scsvrStapleyBouncePosition.transitionSecs')
    // console.log(toTransEndPxPerSec, distToTransEnd, scsvrStapleyBouncePosition.transitionSecs);
    // console.log('^^^^^^^^^^^^^')
};

function scsvrStapleyMoveToNewBounce(firstBounce=true, debugFinalLoopXXXXXX=false) {

    // scsvrStapleyBoxElem.style.transition = 'none';
    // scsvrStapleyBoxElem.style.opacity = 0;

    // const startEdgeStr = randChoice(Object.keys(scsvrStapleyEdgeOppositeKeyValue));
    // const startRotationTurns = Math.random();
    // const invertRandFloat = Math.random();
    // const invertBool = invertRandFloat < 0.5;
    // scsvrStapleyReposition(startEdgeStr, startRotationTurns, invertBool);
    calcNextBouncePosition();
    // console.log('calcNextBouncePosition(), scsvrStapleyBouncePosition:')
    // console.log(scsvrStapleyBouncePosition)
    scsvrStapleyBoxElem.style.transition = `all ${scsvrStapleyBouncePosition.transitionSecs}s linear`;
    scsvrStapleyBoxElem.style.top = `${scsvrStapleyBouncePosition.endTransitionY}px`;
    scsvrStapleyBoxElem.style.left = `${scsvrStapleyBouncePosition.endTransitionX}px`;

    if (    settings['bounce screensaver']['filter background'] 
            && settings['bounce screensaver']['change filter on bounce'] 
            && !firstBounce
        ) scsvrRandBgFilter();

    if (!debugFinalLoopXXXXXX) {
    // scsvrStapleyTimeoutId = setTimeout(() => {
        // scsvrStapleyBoxElem.style.transition = `all ${scsvrStapleyCrossingSecs}s linear`;  ////// TODO Use CSS, doesn't change!
        // const finishEdgeStr = scsvrStapleyEdgeOppositeKeyValue[startEdgeStr];
        // const finishRotationTurns = scsvrStapleyGetRandEndRotationTurns(startRotationTurns);
        // scsvrStapleyReposition(finishEdgeStr, finishRotationTurns, invertBool);
        // const nextCrossingTimeoutMsecs = (scsvrStapleyCrossingSecs + scsvrStapleyBeforeCrossingSecs) * 1000;
        clearTimeout(scsvrStapleyTimeoutId);
        scsvrStapleyTimeoutId = setTimeout(() => {
            scsvrStapleyMoveToNewBounce(false); 
        }, scsvrStapleyBouncePosition.secsBeforeBounce * 1000);
    };
    // }, 40);
};

function scsvrStapleyRandCrossing() {

    scsvrStapleyBoxElem.style.transition = 'none';
    scsvrStapleyBoxElem.style.opacity = 0;

    const startEdgeStr = randChoice(Object.keys(scsvrStapleyEdgeOppositeKeyValue));
    const startRotationTurns = Math.random();
    const invertRandFloat = Math.random();
    const invertBool = invertRandFloat < 0.5;
    scsvrStapleyReposition(startEdgeStr, startRotationTurns, invertBool);

    clearTimeout(scsvrStapleyTimeoutId);
    scsvrStapleyTimeoutId = setTimeout(() => {
        scsvrStapleyBoxElem.style.transition = `all ${scsvrStapleyCrossingSecs}s linear`;
        const finishEdgeStr = scsvrStapleyEdgeOppositeKeyValue[startEdgeStr];
        const finishRotationTurns = scsvrStapleyGetRandEndRotationTurns(startRotationTurns);
        scsvrStapleyReposition(finishEdgeStr, finishRotationTurns, invertBool);
        const nextCrossingTimeoutMsecs = (scsvrStapleyCrossingSecs + scsvrStapleyBeforeCrossingSecs) * 1000;
        clearTimeout(scsvrStapleyTimeoutId);
        scsvrStapleyTimeoutId = setTimeout(() => {
            scsvrStapleyRandCrossing(); 
        }, nextCrossingTimeoutMsecs);
    }, 200);  // If too brief, prerequisite positioning doesn't complete, causing a bug.
};

function scsvrStapleyReposition(edgeStr, rotationTurns, invert=false, enableScaling=true, timeoutMsecs=0, endOpacity=1) {
    // EdgeStr must be one of: 'top', 'bottom', 'left', 'right'
    // If endOpacity is null, opacity is left unchanged.

    clearTimeout(scsvrStapleyRepositionTimeoutId)
    scsvrStapleyRepositionTimeoutId = setTimeout(() => {

        let transformStr = '';

        if (edgeStr === 'top' || edgeStr === 'bottom') {

            const edgeRandPositionPx = (window.innerWidth - scsvrStapleyBoxHypotenusePx) * Math.random() + scsvrStapleyBoxSafeGapPxX / 2;
            scsvrStapleyBoxElem.style.left = `${edgeRandPositionPx.toFixed(0)}px`;
            scsvrStapleyBoxElem.style.right = 'auto';
            scsvrStapleyBoxElem.style.bottom = 'auto';

            if (edgeStr === 'top') {
                scsvrStapleyBoxElem.style.top = '0px';
                transformStr += `translateY(-${scsvrStapleyBoxHypotenusePx}px)`;
            } else {
                // edgeStr === 'bottom'
                scsvrStapleyBoxElem.style.top = `${window.innerHeight + scsvrStapleyBoxSafeGapPxY}px`;
                transformStr += 'translateY(0%)';
            };

        } else {  // edgeStr === 'left' || edgeStr === 'right'

            const edgeRandPositionPx = (window.innerHeight - scsvrStapleyBoxHypotenusePx) * Math.random() + scsvrStapleyBoxSafeGapPxY / 2;
            scsvrStapleyBoxElem.style.top = `${edgeRandPositionPx.toFixed(0)}px`;
            scsvrStapleyBoxElem.style.right = 'auto';
            scsvrStapleyBoxElem.style.bottom = 'auto';

            if (edgeStr === 'left') {
                scsvrStapleyBoxElem.style.left = '0px';
                transformStr += `translateX(-${scsvrStapleyBoxHypotenusePx}px)`;
            } else {
                // edgeStr === 'right'
                scsvrStapleyBoxElem.style.left = `${window.innerWidth + scsvrStapleyBoxSafeGapPxX}px`;
                transformStr += 'translateX(0%)';
            };
        };

        if (enableScaling) {
            const randScaleY = (1 - scsvrStapleyMinScale) * Math.random() + scsvrStapleyMinScale;
            let randScaleX = randScaleY;
            if (invert) randScaleX *= -1;
            transformStr += ` scaleX(${randScaleX.toFixed(2)}) scaleY(${randScaleY.toFixed(2)})`;
        };

        transformStr += ` rotate(${rotationTurns.toFixed(2)}turn)`;
        scsvrStapleyBoxElem.style.transform = transformStr;
        if (endOpacity !== null) scsvrStapleyBoxElem.style.opacity = endOpacity;

    }, timeoutMsecs);
};

function loadJokes() {
    // console.log('loadJokes()');
    try { 
        fetch('/static/stapley/jokes.csv')
        .then((response) => response.text())
        .then((responseStr) => jokes2dArray = csvResponseStrTo2dArray(responseStr));
    } catch (error) { 
        console.error('Error in loadJokes(). Likely unable to load XLSX package.', error);
    };
};

function loadLibrary(scriptSrc, funcOnLoad=null) {
    const scriptElem = document.createElement('script');
    scriptElem.src = scriptSrc;
    if (funcOnLoad !== null) scriptElem.onload = funcOnLoad;
    document.head.appendChild(scriptElem);
};


// UTILITY FUNCTIONS

////// Todo: add to utility.js
function substringObjCompareFunc(a, b) {
    return a.insertIndex - b.insertIndex;
};
function insertSubstrings(mainString, substrings) {
    // mainString = 'START MIDDLE END';
    // substringsObj = [  // Doesn't need to be sorted at input.
    //     {substring: 'substring1 ', insertIndex: 6, }, 
    //     {substring: 'substring2 ', insertIndex: 13, }, 
    // ];
    // insertSubstrings(mainString, substringsObj) => 'START substring1 MIDDLE substring2 END'
        // To add a substring to the end of mainString, set insertIndex to mainString.length.
    // TODO ////// Uses substrings.pop() which changes the outer scope variable.

    // const substringsArray = [];
    // for (const substring in substrings) {
    //     const substringObj = {substring: substring, insertIndex: substrings[substring], };
    //     substringsArray.push(substringObj);
    // };
    substrings.sort(substringObjCompareFunc);

    let newString = '';
    let substringNum = -1;
    for (const substringObj of substrings) {
        substringNum++;
        let startIndex = 0;
        if (substringNum > 0) startIndex = substrings[substringNum - 1].insertIndex;         
        newString += mainString.substring(startIndex, substringObj.insertIndex);
        newString += substringObj.substring;
    };

    const finalStartIndex = substrings.pop().insertIndex;
    newString += mainString.substring(finalStartIndex);
    return newString;
};

function randFloat(min, max) {
    // min <= randFloat < max
    return Math.random() * (max - min) + min;
};

function randInt(min, max) {
    // min <= randInt <= max
    return Math.floor(Math.random() * (max - min + 1) + min);
};

function randChoice(array) {
    if (array.length === 0) return null;
    const index = Math.floor(Math.random() * array.length);
    return array[index];
};
