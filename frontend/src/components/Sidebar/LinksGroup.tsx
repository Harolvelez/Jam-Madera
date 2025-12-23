import { useState, useEffect } from "react";
import {
  Group,
  Collapse,
  ThemeIcon,
  UnstyledButton,
  Text,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import classes from "./SidebarNested.module.css";

interface LinksGroupProps {
  icon: any;
  label: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
  link?: string;
}

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  links,
  link,
}: LinksGroupProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const hasLinks = Array.isArray(links);

  // 🔥 detectar activo
  const isChildActive =
    hasLinks &&
    links!.some((l) => location.pathname.startsWith(l.link));

  const isActive =
    link && location.pathname === link;

  const [opened, setOpened] = useState(
    initiallyOpened || isChildActive
  );

  // 🔄 abrir automáticamente si estoy dentro
  useEffect(() => {
    if (isChildActive) setOpened(true);
  }, [isChildActive]);

  const items = (hasLinks ? links : []).map((l) => {
    const active = location.pathname === l.link;

    return (
      <NavLink
        key={l.label}
        to={l.link}
        className={`${classes.link} ${
          active ? classes.linkActive : ""
        }`}
      >
        {l.label}
      </NavLink>
    );
  });

  const handleClick = () => {
    if (hasLinks) {
      setOpened((o) => !o);
    } else if (link) {
      navigate(link);
    }
  };

  return (
    <>
      <UnstyledButton
        onClick={handleClick}
        className={`${classes.control} ${
          isActive || isChildActive ? classes.controlActive : ""
        }`}
      >
        <Group justify="space-between">
          <Group>
            <ThemeIcon variant="light" size={30}>
              <Icon size={18} />
            </ThemeIcon>
            <Text fw={isActive || isChildActive ? 600 : 400}>
              {label}
            </Text>
          </Group>

          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              size={16}
              style={{
                transform: opened ? "rotate(90deg)" : "none",
              }}
            />
          )}
        </Group>
      </UnstyledButton>

      {hasLinks && <Collapse in={opened}>{items}</Collapse>}
    </>
  );
}