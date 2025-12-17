import { useState } from "react";
import { Group, Collapse, ThemeIcon, UnstyledButton, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { NavLink } from "react-router-dom"; // ✅
import classes from "./SidebarNested.module.css";

interface LinksGroupProps {
  icon: any;
  label: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
  link?: string;
}

export function LinksGroup({ icon: Icon, label, initiallyOpened, links, link }: LinksGroupProps) {
  const [opened, setOpened] = useState(initiallyOpened || false);
  const hasLinks = Array.isArray(links);

  const items = (hasLinks ? links : []).map((l) => (
    <NavLink key={l.label} to={l.link} className={classes.link}>
      {l.label}
    </NavLink>
  ));

  const handleClick = () => {
    if (hasLinks) setOpened((o) => !o);
  };

  return (
    <>
      <UnstyledButton onClick={handleClick} className={classes.control}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon variant="light" size={30}>
              <Icon size={18} />
            </ThemeIcon>
            <Text>{label}</Text>
          </Group>

          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              size={16}
              style={{
                transform: opened ? "rotate(90deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          )}
        </Group>
      </UnstyledButton>

      {hasLinks && <Collapse in={opened}>{items}</Collapse>}

      {/* ✅ Si es link simple (sin sublinks), lo hacemos clickeable */}
      {!hasLinks && link && (
        <NavLink to={link} className={classes.link} style={{ marginLeft: 44 }}>
          Ir
        </NavLink>
      )}
    </>
  );
}
