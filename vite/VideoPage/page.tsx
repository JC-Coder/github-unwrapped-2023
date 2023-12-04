import { useMemo } from "react";
import type { z } from "zod";
import { generateRandomCorner } from "../../remotion/TopLanguages/corner";
import {
  LanguagesEnum,
  PlanetEnum,
  type compositionSchema,
  type languageSchema,
} from "../../src/config";
import type { ProfileStats } from "../../src/server/db";
import { Navbar } from "../Home/Navbar";
import { NotFound } from "../NotFound/NotFound";
import { VideoPageBackground } from "./Background";
import { VideoBox } from "./VideoBox";
import styles from "./styles.module.css";
declare global {
  interface Window {
    __USER__: ProfileStats;
  }
}

type CompositionParameters = z.infer<typeof compositionSchema>;

const computePlanet = (userStats: ProfileStats): z.infer<typeof PlanetEnum> => {
  if (userStats.totalContributions > 10000) {
    return PlanetEnum.Enum.Gold;
  }

  if (userStats.totalContributions > 1000) {
    return PlanetEnum.Enum.Silver;
  }

  return PlanetEnum.Enum.Ice;
};

const parseTopLanguage = (topLanguage: {
  languageName: string;
  color: string;
}): z.infer<typeof languageSchema> => {
  try {
    // TODO: Rust1, Rust2, Rust3
    const lang = LanguagesEnum.parse(topLanguage.languageName);
    return {
      type: "designed",
      name: lang,
    };
  } catch (e) {
    return {
      type: "other",
      color: topLanguage.color,
      name: topLanguage.languageName,
    };
  }
};

const computeCompositionParameters = (
  userStats: ProfileStats | null,
): CompositionParameters | null => {
  if (userStats === null) return null;

  return {
    login: userStats.username,
    corner: generateRandomCorner({
      lowercasedUsername: userStats.lowercasedUsername,
    }),
    language1: parseTopLanguage(userStats.topLanguages[0]),
    language2:
      userStats.topLanguages.length > 1
        ? parseTopLanguage(userStats.topLanguages[1])
        : null,
    language3:
      userStats.topLanguages.length > 2
        ? parseTopLanguage(userStats.topLanguages[2])
        : null,
    showHelperLine: false,
    planet: computePlanet(userStats),
    starsGiven: userStats.totalStars,
    issuesClosed: userStats.closedIssues,
    issuesOpened: userStats.openIssues,
    totalPullRequests: userStats.totalPullRequests,
    topWeekday: userStats.topWeekday,
    topHour: userStats.topHour,
    graphData: userStats.graphData,
  };
};

const background: React.CSSProperties = {
  width: "100vw",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "absolute",
};

export const UserPage = () => {
  const inputProps: CompositionParameters | null = useMemo(() => {
    return computeCompositionParameters(window.__USER__);
  }, []);

  if (inputProps === null) {
    return <NotFound />;
  }

  return (
    <div
      className={styles.wrapper}
      style={{
        backgroundColor: "#000",
      }}
    >
      <div style={background} id="videobackground">
        <VideoPageBackground />
      </div>
      <Navbar />
      <VideoBox inputProps={inputProps} />
    </div>
  );
};
