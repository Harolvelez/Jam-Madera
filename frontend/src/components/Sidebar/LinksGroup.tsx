import { useState } from "react";
import { Group, Box, Collapse, ThemeIcon, UnstyledButton, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import classes from "./SidebarNested.module.css";

interface LinksGroupProps {
  icon: any;
  label: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
}

export function LinksGroup({ icon: Icon, label, initiallyOpened, links }: LinksGroupProps) {
  const [opened, setOpened] = useState(initiallyOpened || false);
  const hasLinks = Array.isArray(links);

  const items = (hasLinks ? links : []).map((link) => (
    <Text
      component="a"
      href={link.link}
      className={classes.link}
      key={link.label}
    >
      {link.label}
    </Text>
  ));

  return (
    <>
      <UnstyledButton onClick={() => setOpened((o) => !o)} className={classes.control}>
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

      {hasLinks && (
        <Collapse in={opened}>{items}</Collapse>
      )}
    </>
  );
}