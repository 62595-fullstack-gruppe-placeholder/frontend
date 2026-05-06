"use client"

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { extensionsUtil } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";
import { useState, useCallback, useMemo } from "react";

interface Props {
    onSelectedChange: (selected: Set<string>) => void;
    extensions: Set<string>;
}

const extensionCategories = {
    "Programming Languages": [
        ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".go", ".rb", ".php",
        ".swift", ".kt", ".kts", ".rs", ".scala", ".clj", ".elm",
        ".ex", ".exs", ".erl", ".hrl", ".hs", ".lhs", ".lua", ".pl",
        ".pm", ".r", ".R", ".dart", ".fs", ".fsx", ".fsi", ".fsscript"
    ],
    "Markup & Templates": [
        ".html", ".htm", ".xml", ".vue", ".svelte", ".tex"
    ],
    "Data & Config Files": [
        ".json", ".yml", ".yaml", ".toml", ".ini", ".cfg", ".conf", ".config", ".env",
        ".gitignore", ".gitattributes", ".npmrc", ".yarnrc", ".piprc", ".pypirc",
        ".gemrc", ".bowerrc", ".eslintrc", ".prettierrc", ".babelrc", ".editorconfig"
    ],
    "Scripts": [
        ".sh", ".bash", ".zsh", ".fish", ".ps1", ".bat", ".cmd"
    ],
    "Documentation": [
        ".txt", ".rst", ".csv"
    ],
    "Build & Package Files": [
        "Makefile", "CMakeLists.txt", "build.gradle", "pom.xml",
        "package.json", "package-lock.json", "yarn.lock", "Gemfile",
        "Podfile", "Cargo.toml", "go.mod", "requirements.txt",
        "Pipfile", "Pipfile.lock", "environment.yml", "setup.py"
    ],
    "Other": [
        ".dockerfile", "Dockerfile", ".css", ".scss", ".sass", ".less", ".sql"
    ]
};

export function IgnoreSettingsButtons({ onSelectedChange, extensions }: Props) {
    const [isSettingsShown, setIsSettingsShown] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const allExtensions = extensionsUtil;

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return extensionCategories;

        const filtered: Record<string, string[]> = {};
        Object.entries(extensionCategories).forEach(([category, exts]) => {
            const filteredExts = exts.filter(ext => ext.toLowerCase().includes(searchTerm.toLowerCase()));
            if (filteredExts.length > 0) {
                filtered[category] = filteredExts;
            }
        });
        return filtered;
    }, [searchTerm]);

    const toggleCategory = useCallback((category: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedCategories(newExpanded);
    }, [expandedCategories]);

    const toggleExt = useCallback((ext: string) => {
        const newSelected = new Set(extensions);
        if (newSelected.has(ext)) {
            newSelected.delete(ext);
        } else {
            newSelected.add(ext);
        }
        onSelectedChange(newSelected);
    }, [extensions, onSelectedChange]);

    const selectAll = useCallback((): void => {
        onSelectedChange(new Set(allExtensions));
    }, [allExtensions, onSelectedChange]);

    const deselectAll = useCallback((): void => {
        onSelectedChange(new Set<string>());
    }, [onSelectedChange]);

    const selectCategory = useCallback((categoryExts: string[]) => {
        const newSelected = new Set(extensions);
        categoryExts.forEach(ext => newSelected.add(ext));
        onSelectedChange(newSelected);
    }, [extensions, onSelectedChange]);

    const deselectCategory = useCallback((categoryExts: string[]) => {
        const newSelected = new Set(extensions);
        categoryExts.forEach(ext => newSelected.delete(ext));
        onSelectedChange(newSelected);
    }, [extensions, onSelectedChange]);

    return (
        <div className="w-full border-t border-secondary/10 bg-background/50 p-4">
            <div
                className="flex w-full items-center justify-between p-6 cursor-pointer hover:bg-white/5 transition-colors border-secondary/10"
                onClick={() => setIsSettingsShown(!isSettingsShown)}>
                <div className="flex items-center gap-4">
                    <h2 className="h2">Scan Settings</h2>
                </div>
                <div className={`transition-transform duration-300 ${isSettingsShown ? 'rotate-180' : ''}`}>
                    <ChevronDown size={24} className="text-secondary" />
                </div>
            </div>
            {isSettingsShown && (
                <div className="space-y-4 py-6">
                    <p>Select the file extensions you want to include in the scan. Unchecked extensions will be ignored.</p>
                    <div className="flex items-center gap-2">
                        <Search size={16} className="text-secondary" />
                        <Input
                            placeholder="Search extensions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                    <div className="flex justify-center items-center gap-4 w-full">
                        <Button className="bg-button-main" onClick={selectAll}>Select all</Button>
                        <Button className="bg-secondary" onClick={deselectAll}>Deselect all</Button>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(filteredCategories).map(([category, exts]) => {
                            const isExpanded = expandedCategories.has(category);
                            const checkedCount = exts.filter(ext => extensions.has(ext)).length;
                            const totalCount = exts.length;
                            return (
                                <div key={category} className="border border-secondary/10 rounded-lg">
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
                                        onClick={() => toggleCategory(category)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            <h3 className="font-medium">{category}</h3>
                                            <span className="text-sm text-secondary">({checkedCount}/{totalCount})</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); selectCategory(exts); }}>Select all</Button>
                                            <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); deselectCategory(exts); }}>Deselect all</Button>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div className="p-4 pt-0">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {exts.map(ext => {
                                                    const id = `ext-${ext}`;
                                                    const isChecked = extensions.has(ext);
                                                    return (
                                                        <label key={ext} className="inline-flex items-center gap-2 cursor-pointer min-w-0">
                                                            <Checkbox
                                                                id={id}
                                                                name={id}
                                                                checked={isChecked}
                                                                onCheckedChange={() => toggleExt(ext)}
                                                            />
                                                            <Label htmlFor={id} className="text-sm truncate">{ext}</Label>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}