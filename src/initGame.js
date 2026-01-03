import makeKaplayCtx from "./kaplayCtx";
import makePlayer from "./entities/Player";
import makeSection from "./components/Section";
import { PALETTE } from "./constants";
import makeSocialIcon from "./components/SocialIcon";
import makeSkillIcon from "./components/SkillIcon";
import { makeAppear } from "./utils";
import makeWorkExperienceCard from "./components/WorkExperienceCard";
import makeEmailIcon from "./components/EmailIcon";
import makeProjectCard from "./components/ProjectCard";
import { cameraZoomValueAtom, store } from "./store";

export default async function initGame() {
    const generalData = await (await fetch("./configs/generalData.json")).json();
    const projectsData = await (await fetch("./configs/projectsData.json")).json();
    const skillsData = await (await fetch("./configs/skillsData.json")).json();
    const socialsData = await (await fetch("./configs/socialsData.json")).json();
    const experiencesData = await (await fetch("./configs/experiencesData.json")).json();

    const k = makeKaplayCtx();
    const {
        add,
        rect,
        width,
        height,
        pos,
        anchor,
        fixed,
        shader,
        vec2,
        time,
    } = k;
    k.loadSprite("player", "./sprites/player.png", {
        sliceX: 6,
        sliceY: 8,
        anims: {
            "walk-left": { from: 0, to: 5, loop: true, speed: 10 },
            "walk-right": { from: 6, to: 11, loop: true, speed: 10 },
            "walk-down": { from: 12, to: 17, loop: true, speed: 10 },
            "walk-up": { from: 18, to: 23, loop: true, speed: 10 },
            "walk-down-idle": { from: 24, to: 25, loop: true, speed: 2 },
            "walk-up-idle": { from: 30, to: 31, loop: true, speed: 2 },
            "walk-left-idle": { from: 36, to: 37, loop: true, speed: 2 },
            "walk-right-idle": { from: 42, to: 43, loop: true, speed: 2 },
        }
    });
    k.loadFont("ibm-regular", "./fonts/IBMPlexSans-Regular.ttf");
    k.loadFont("ibm-bold", "./fonts/IBMPlexSans-Bold.ttf");

    k.loadSprite("email-logo", "./logos/email-logo.png");
    k.loadSprite("postgres-logo", "./logos/postgres-logo.png");
    k.loadSprite("python-logo", "./logos/python-logo.png");
    k.loadSprite("linkedin-logo", "./logos/linkedin-logo.png");
    k.loadSprite("github-logo", "./logos/github-logo.png");
    k.loadSprite("cloud-logo", "./logos/cloud-logo.png");
    k.loadSprite("pytorch-logo", "./logos/pytorch-logo.png");
    k.loadSprite("analysis-logo", "./logos/analysis-logo.png");
    k.loadSprite("ml-logo", "./logos/ml-logo.png");
    k.loadSprite("team-logo", "./logos/team-logo.png");
    // k.loadSprite("bank-logo", "./logos/bank-logo.png");
    // k.loadSprite("ant-logo", "./logos/ant-logo.png");
    // k.loadSprite("health-logo", "./logos/health-logo.png");
    // k.loadSprite("truck-logo", "./logos/truck-logo.png");
    // k.loadSprite("map-logo", "./logos/map-logo.png");

    for (const project of projectsData) {
        k.loadSprite(project.thumbnail, `./projects/${project.thumbnail}.png`);
    }

    const setInitCamZoomValue = () => {
        if (k.width() < 1000) {
            k.camScale(k.vec2(0.5));
            store.set(cameraZoomValueAtom, 0.5);
            return;
        }
        k.camScale(k.vec2(0.8));
        store.set(cameraZoomValueAtom, 0.8);
    };
    setInitCamZoomValue();

    k.onUpdate(() => {
        const cameraZoomValue = store.get(cameraZoomValueAtom);
        if (cameraZoomValue !== k.camScale().x) k.camScale(k.vec2(cameraZoomValue));
    });

    makeSection(
        k,
        k.vec2(k.center().x, k.center().y - 400),
        generalData.section1Name,
        (parent) => {
            const container = parent.add([k.pos(-805, -700), k.opacity(0)]);

            container.add([
                k.text(generalData.header.title, { font: "ibm-bold", size: 88 }),
                k.color(k.Color.fromHex(PALETTE.color2)),
                k.pos(455, -100),
                k.opacity(0),
            ]);

            container.add([
                k.text(generalData.header.subtitle, {
                    font: "ibm-bold",
                    size: 48,
                }),
                k.color(k.Color.fromHex(PALETTE.color2)),
                k.pos(485, 0),
                k.opacity(0),
            ]);

            const socialContainer = container.add([k.pos(130, 0), k.opacity(0)]);

            for (const socialData of socialsData) {
                if (socialData.name === "Email") {
                    makeEmailIcon(
                        k,
                        socialContainer,
                        k.vec2(socialData.pos.x, socialData.pos.y),
                        socialData.logoData,
                        socialData.name,
                        socialData.address
                    );
                    continue;
                }

                makeSocialIcon(
                    k,
                    socialContainer,
                    k.vec2(socialData.pos.x, socialData.pos.y),
                    socialData.logoData,
                    socialData.name,
                    socialData.link,
                    socialData.description
                );
            }

            makeAppear(k, container);
            makeAppear(k, socialContainer);
        }
    );

    makeSection(
        k,
        k.vec2(k.center().x - 400, k.center().y),
        generalData.section2Name,
        (parent) => {
            /* make the container independent of the section
             so that the skill icons appear on top of every section's children.
             so that when the skill icons are pushed around by the player
             they always remain on top */
            const container = k.add([
                k.opacity(0),
                k.pos(parent.pos.x - 300, parent.pos.y),
            ]);

            for (const skillData of skillsData) {
                makeSkillIcon(
                    k,
                    container,
                    k.vec2(skillData.pos.x, skillData.pos.y),
                    skillData.logoData,
                    skillData.name
                );
            }

            makeAppear(k, container);
        }
    );

    makeSection(
        k,
        k.vec2(k.center().x + 400, k.center().y),
        generalData.section3Name,
        (parent) => {
            const container = parent.add([k.opacity(0), k.pos(60, 0)]);
            for (const experienceData of experiencesData) {
                makeWorkExperienceCard(
                    k,
                    container,
                    k.vec2(experienceData.pos.x, experienceData.pos.y),
                    experienceData.cardHeight,
                    experienceData.roleData
                );
            }

            makeAppear(k, container);
        }
    );

    makeSection(
        k,
        k.vec2(k.center().x, k.center().y + 400),
        generalData.section4Name,
        (parent) => {
            const container = parent.add([k.opacity(0), k.pos(0, 0)]);

            for (const project of projectsData) {
                makeProjectCard(
                    k,
                    container,
                    k.vec2(project.pos.x, project.pos.y),
                    project.data,
                    project.thumbnail
                );
            }

            makeAppear(k, container);
        }
    );

    makePlayer(k, k.vec2(k.center()), 600);
}
