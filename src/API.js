import fetch from "node-fetch";
import secrets from "../secrets.json" assert {type: "json"}

const HEADERS = {
    "accept": "*/*",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/json",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "x-ka-fkey": "0",
    "cookie": `KAAS=${secrets.KAAS}; fkey=0;`,
    "Referrer-Policy": "strict-origin-when-cross-origin"
};

export async function getUserProfile(username) {
    return (await (await fetch("https://www.khanacademy.org/api/internal/graphql/getFullUserProfile", {
        "headers": HEADERS,
        "body": "{\"operationName\":\"getFullUserProfile\",\"query\":\"query getFullUserProfile($kaid: String, $username: String) {\\n  user(kaid: $kaid, username: $username) {\\n    id\\n    kaid\\n    key\\n    userId\\n    email\\n    username\\n    profileRoot\\n    gaUserId\\n    qualarooId\\n    isPhantom\\n    isDeveloper: hasPermission(name: \\\"can_do_what_only_admins_can_do\\\")\\n    isCurator: hasPermission(name: \\\"can_curate_tags\\\", scope: ANY_ON_CURRENT_LOCALE)\\n    isCreator: hasPermission(name: \\\"has_creator_role\\\", scope: ANY_ON_CURRENT_LOCALE)\\n    isPublisher: hasPermission(name: \\\"can_publish\\\", scope: ANY_ON_CURRENT_LOCALE)\\n    isModerator: hasPermission(name: \\\"can_moderate_users\\\", scope: GLOBAL)\\n    isParent\\n    isSatStudent\\n    isTeacher\\n    isDataCollectible\\n    isChild\\n    isOrphan\\n    isCoachingLoggedInUser\\n    canModifyCoaches\\n    nickname\\n    hideVisual\\n    joined\\n    points\\n    countVideosCompleted\\n    bio\\n    profile {\\n      accessLevel\\n      __typename\\n    }\\n    soundOn\\n    muteVideos\\n    showCaptions\\n    prefersReducedMotion\\n    noColorInVideos\\n    autocontinueOn\\n    newNotificationCount\\n    canHellban: hasPermission(name: \\\"can_ban_users\\\", scope: GLOBAL)\\n    canMessageUsers: hasPermission(name: \\\"can_send_moderator_messages\\\", scope: GLOBAL)\\n    isSelf: isActor\\n    hasStudents: hasCoachees\\n    hasClasses\\n    hasChildren\\n    hasCoach\\n    badgeCounts\\n    homepageUrl\\n    isMidsignupPhantom\\n    includesDistrictOwnedData\\n    canAccessDistrictsHomepage\\n    preferredKaLocale {\\n      id\\n      kaLocale\\n      status\\n      __typename\\n    }\\n    underAgeGate {\\n      parentEmail\\n      daysUntilCutoff\\n      approvalGivenAt\\n      __typename\\n    }\\n    authEmails\\n    signupDataIfUnverified {\\n      email\\n      emailBounced\\n      __typename\\n    }\\n    pendingEmailVerifications {\\n      email\\n      __typename\\n    }\\n    tosAccepted\\n    shouldShowAgeCheck\\n    __typename\\n  }\\n  actorIsImpersonatingUser\\n}\\n\",\"variables\":{\"username\":\""+username+"\"}}",
        "method": "POST"
    })).json()).data.user;
}

export async function projectsAuthoredBy(kaid, options) {
    let _options = options || {sortBy:null,limit:null};
    let sortBy = _options.sortBy?? "TOP";
    let limit = _options.limit?? 40;
    let res = await fetch("https://www.khanacademy.org/api/internal/graphql/projectsAuthoredByUser", {
        "headers": HEADERS,
        "body": "{\"operationName\":\"projectsAuthoredByUser\",\"query\":\"query projectsAuthoredByUser($kaid: String, $pageInfo: ListProgramsPageInfo, $sort: ListProgramSortOrder) {\\n  user(kaid: $kaid) {\\n    id\\n    programs(pageInfo: $pageInfo, sort: $sort) {\\n      complete\\n      cursor\\n      programs {\\n        id\\n        key\\n        authorKaid\\n        authorNickname\\n        displayableSpinoffCount\\n        imagePath\\n        sumVotesIncremented\\n        translatedTitle: title\\n        url\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\",\"variables\":{\"kaid\":\""+kaid+"\",\"sort\":\""+sortBy+"\",\"pageInfo\":{\"cursor\":\"\",\"itemsPerPage\":"+limit+"}}}",
        "method": "POST"
    });
    let parsed = await res.json();
    let programs = parsed.data.user.programs.programs;
    return programs;
}

export async function scratchpad(id) {
    // return (await (await fetch("https://www.khanacademy.org/api/internal/x?scratchpad_id="+id+"&casing=camel", {
    //     "headers": HEADERS,
    //     "method": "GET"
    // })).json()).scratchpad;
    let res = await fetch("https://www.khanacademy.org/api/internal/graphql/programQuery?lang=en&curriculum=in-in&_=221219-1233-d6971254fbeb_1671519456666", {
      "headers": HEADERS,
      "body": "{\"operationName\":\"programQuery\",\"query\":\"query programQuery($programId: String!) {\\n  programById(id: $programId) {\\n    byChild\\n    category\\n    created\\n    creatorProfile: author {\\n      id\\n      nickname\\n      profileRoot\\n      profile {\\n        accessLevel\\n        __typename\\n      }\\n      __typename\\n    }\\n    deleted\\n    description\\n    spinoffCount: displayableSpinoffCount\\n    docsUrlPath\\n    flags\\n    flaggedBy: flaggedByKaids\\n    flaggedByUser: isFlaggedByCurrentUser\\n    height\\n    hideFromHotlist\\n    id\\n    imagePath\\n    isProjectOrFork: originIsProject\\n    isOwner\\n    kaid: authorKaid\\n    key\\n    newUrlPath\\n    originScratchpad: originProgram {\\n      deleted\\n      translatedTitle\\n      url\\n      __typename\\n    }\\n    restrictPosting\\n    revision: latestRevision {\\n      id\\n      code\\n      configVersion\\n      created\\n      editorType\\n      folds\\n      __typename\\n    }\\n    slug\\n    sumVotesIncremented\\n    title\\n    topic: parentCurationNode {\\n      id\\n      nodeSlug: slug\\n      relativeUrl\\n      slug\\n      translatedTitle\\n      __typename\\n    }\\n    translatedTitle\\n    url\\n    userAuthoredContentType\\n    upVoted\\n    width\\n    __typename\\n  }\\n}\\n\",\"variables\":{\"programId\":\""+id+"\"}}",
      "method": "POST"
    });
    let parsed = await res.json();
    let program = parsed.data.programById;
    return program;
}

export async function feedback(id, options) {
    // Fetches feedback on a program
    // Feedback types: COMMENT, QUESTION
    // If feedbackType is not specified, defaults to tips and thanks
    // sortBy can be: Recent=2, Top=1
    // if sortBy is not specified it sorts by top as default
    let _options = options || {feedbackType:null, sortBy:null};
    let feedbackType = _options.feedbackType?? "COMMENT";
    let sortBy = (_options.sortBy=="recent") ? 2 : 1;

    return (await (await fetch("https://www.khanacademy.org/api/internal/graphql/feedbackQuery", {
        "headers": HEADERS,
        "body": "{\"operationName\":\"feedbackQuery\",\"variables\":{\"topicId\":\""+id+"\",\"feedbackType\":\""+feedbackType+"\",\"currentSort\":"+sortBy+",\"focusKind\":\"scratchpad\"},\"query\":\"query feedbackQuery($topicId: String!, $focusKind: String!, $cursor: String, $limit: Int, $feedbackType: FeedbackType!, $currentSort: Int, $qaExpandKey: String) {\\n  feedback(focusId: $topicId, cursor: $cursor, limit: $limit, feedbackType: $feedbackType, focusKind: $focusKind, sort: $currentSort, qaExpandKey: $qaExpandKey) {\\n    feedback {\\n      replyCount\\n      appearsAsDeleted\\n      author {\\n        id\\n        kaid\\n        nickname\\n        avatar {\\n          name\\n          imageSrc\\n          __typename\\n        }\\n        __typename\\n      }\\n      badges {\\n        name\\n        icons {\\n          smallUrl\\n          __typename\\n        }\\n        description\\n        __typename\\n      }\\n      content\\n      date\\n      definitelyNotSpam\\n      deleted\\n      downVoted\\n      expandKey\\n      feedbackType\\n      flaggedBy\\n      flaggedByUser\\n      flags\\n      focusUrl\\n      focus {\\n        kind\\n        id\\n        translatedTitle\\n        relativeUrl\\n        __typename\\n      }\\n      fromVideoAuthor\\n      key\\n      lowQualityScore\\n      notifyOnAnswer\\n      permalink\\n      qualityKind\\n      replyCount\\n      replyExpandKeys\\n      showLowQualityNotice\\n      sumVotesIncremented\\n      upVoted\\n      ... on QuestionFeedback {\\n        hasAnswered\\n        answers {\\n          replyCount\\n          appearsAsDeleted\\n          author {\\n            id\\n            kaid\\n            nickname\\n            avatar {\\n              name\\n              imageSrc\\n              __typename\\n            }\\n            __typename\\n          }\\n          badges {\\n            name\\n            icons {\\n              smallUrl\\n              __typename\\n            }\\n            description\\n            __typename\\n          }\\n          content\\n          date\\n          definitelyNotSpam\\n          deleted\\n          downVoted\\n          expandKey\\n          feedbackType\\n          flaggedBy\\n          flaggedByUser\\n          flags\\n          focusUrl\\n          focus {\\n            kind\\n            id\\n            translatedTitle\\n            relativeUrl\\n            __typename\\n          }\\n          fromVideoAuthor\\n          key\\n          lowQualityScore\\n          notifyOnAnswer\\n          permalink\\n          qualityKind\\n          replyCount\\n          replyExpandKeys\\n          showLowQualityNotice\\n          sumVotesIncremented\\n          upVoted\\n          __typename\\n        }\\n        isOld\\n        __typename\\n      }\\n      ... on AnswerFeedback {\\n        question {\\n          replyCount\\n          appearsAsDeleted\\n          author {\\n            id\\n            kaid\\n            nickname\\n            avatar {\\n              name\\n              imageSrc\\n              __typename\\n            }\\n            __typename\\n          }\\n          badges {\\n            name\\n            icons {\\n              smallUrl\\n              __typename\\n            }\\n            description\\n            __typename\\n          }\\n          content\\n          date\\n          definitelyNotSpam\\n          deleted\\n          downVoted\\n          expandKey\\n          feedbackType\\n          flaggedBy\\n          flaggedByUser\\n          flags\\n          focusUrl\\n          focus {\\n            kind\\n            id\\n            translatedTitle\\n            relativeUrl\\n            __typename\\n          }\\n          fromVideoAuthor\\n          key\\n          lowQualityScore\\n          notifyOnAnswer\\n          permalink\\n          qualityKind\\n          replyCount\\n          replyExpandKeys\\n          showLowQualityNotice\\n          sumVotesIncremented\\n          upVoted\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    cursor\\n    isComplete\\n    sortedByDate\\n    __typename\\n  }\\n}\\n\"}",
        "method": "POST"
    })).json()).data.feedback.feedback;
}

export async function feedbackByAuthor(kaid, options) {
    // Options:
    // Sort, limit
    let _options = options || {sort:3, limit:10, feedbackType:"COMMENT"};
    let sort = _options.sort || 3;
    let limit = _options.limit || 10;
    let feedbackType = _options.feedbackType || "COMMENT";
    let res = await fetch("https://www.khanacademy.org/api/internal/graphql/feedbackForAuthor", {
      "headers": HEADERS,
      "body": "{\"operationName\":\"feedbackForAuthor\",\"variables\":{\"feedbackType\":\""+feedbackType+"\",\"kaid\":\""+kaid+"\",\"cursor\":null,\"limit\":"+limit+",\"sort\":"+sort+"},\"query\":\"query feedbackForAuthor($kaid: String!, $feedbackType: FeedbackType!, $cursor: String, $limit: Int, $sort: Int) {\\n  feedbackForAuthor(kaid: $kaid, feedbackType: $feedbackType, cursor: $cursor, limit: $limit, sort: $sort) {\\n    feedback {\\n      replyCount\\n      appearsAsDeleted\\n      author {\\n        id\\n        kaid\\n        nickname\\n        avatar {\\n          name\\n          imageSrc\\n          __typename\\n        }\\n        __typename\\n      }\\n      content\\n      date\\n      definitelyNotSpam\\n      deleted\\n      downVoted\\n      expandKey\\n      feedbackType\\n      flaggedBy\\n      flags\\n      focusUrl\\n      focus {\\n        kind\\n        id\\n        translatedTitle\\n        __typename\\n      }\\n      fromVideoAuthor\\n      key\\n      lowQualityScore\\n      notifyOnAnswer\\n      permalink\\n      qualityKind\\n      replyCount\\n      replyExpandKeys\\n      showLowQualityNotice\\n      sumVotesIncremented\\n      upVoted\\n      ... on QuestionFeedback {\\n        hasAnswered\\n        isOld\\n        __typename\\n      }\\n      ... on AnswerFeedback {\\n        question {\\n          content\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    isMod\\n    isComplete\\n    cursor\\n    __typename\\n  }\\n}\\n\"}",
      "method": "POST"
    });
    let parsed = await res.json();
    return parsed.data.feedbackForAuthor.feedback;
}