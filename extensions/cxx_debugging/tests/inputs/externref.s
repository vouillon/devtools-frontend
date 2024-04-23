	.text
	.file	"externref.c"
	.functype	f (externref, externref) -> (externref)
	.export_name	f, f
	.section	.text.f,"",@
	.hidden	f                               # -- Begin function f
	.globl	f
	.type	f,@function
f:                                      # @f
.Lfunc_begin0:
	.functype	f (externref, externref) -> (externref)
# %bb.0:
	#DEBUG_VALUE: f:x <- !target-index(0,0)
	#DEBUG_VALUE: f:y <- !target-index(0,1)
	.file	1 "externref.c"
	.loc	1 3 3 prologue_end              # externref.c:3:3
	local.get	0
	return
	end_function
.Ltmp0:
.Lfunc_end0:
                                        # -- End function
	.no_dead_strip	f
	.section	.debug_abbrev,"",@
	.int8	1                               # Abbreviation Code
	.int8	17                              # DW_TAG_compile_unit
	.int8	1                               # DW_CHILDREN_yes
	.int8	37                              # DW_AT_producer
	.int8	14                              # DW_FORM_strp
	.int8	19                              # DW_AT_language
	.int8	5                               # DW_FORM_data2
	.int8	3                               # DW_AT_name
	.int8	14                              # DW_FORM_strp
	.int8	16                              # DW_AT_stmt_list
	.int8	23                              # DW_FORM_sec_offset
	.int8	27                              # DW_AT_comp_dir
	.int8	14                              # DW_FORM_strp
	.int8	17                              # DW_AT_low_pc
	.int8	1                               # DW_FORM_addr
	.int8	18                              # DW_AT_high_pc
	.int8	6                               # DW_FORM_data4
	.int8	0                               # EOM(1)
	.int8	0                               # EOM(2)
	.int8	2                               # Abbreviation Code
	.int8	46                              # DW_TAG_subprogram
	.int8	1                               # DW_CHILDREN_yes
	.int8	17                              # DW_AT_low_pc
	.int8	1                               # DW_FORM_addr
	.int8	18                              # DW_AT_high_pc
	.int8	6                               # DW_FORM_data4
	.int8	64                              # DW_AT_frame_base
	.int8	24                              # DW_FORM_exprloc
	.int8	3                               # DW_AT_name
	.int8	14                              # DW_FORM_strp
	.int8	58                              # DW_AT_decl_file
	.int8	11                              # DW_FORM_data1
	.int8	59                              # DW_AT_decl_line
	.int8	11                              # DW_FORM_data1
	.int8	39                              # DW_AT_prototyped
	.int8	25                              # DW_FORM_flag_present
	.int8	73                              # DW_AT_type
	.int8	19                              # DW_FORM_ref4
	.int8	63                              # DW_AT_external
	.int8	25                              # DW_FORM_flag_present
	.int8	0                               # EOM(1)
	.int8	0                               # EOM(2)
	.int8	3                               # Abbreviation Code
	.int8	5                               # DW_TAG_formal_parameter
	.int8	0                               # DW_CHILDREN_no
	.int8	2                               # DW_AT_location
	.int8	24                              # DW_FORM_exprloc
	.int8	3                               # DW_AT_name
	.int8	14                              # DW_FORM_strp
	.int8	58                              # DW_AT_decl_file
	.int8	11                              # DW_FORM_data1
	.int8	59                              # DW_AT_decl_line
	.int8	11                              # DW_FORM_data1
	.int8	73                              # DW_AT_type
	.int8	19                              # DW_FORM_ref4
	.int8	0                               # EOM(1)
	.int8	0                               # EOM(2)
	.int8	4                               # Abbreviation Code
	.int8	22                              # DW_TAG_typedef
	.int8	0                               # DW_CHILDREN_no
	.int8	73                              # DW_AT_type
	.int8	19                              # DW_FORM_ref4
	.int8	3                               # DW_AT_name
	.int8	14                              # DW_FORM_strp
	.int8	0                               # EOM(1)
	.int8	0                               # EOM(2)
	.int8	5                               # Abbreviation Code
	.int8	19                              # DW_TAG_structure_type
	.int8	0                               # DW_CHILDREN_no
	.int8	3                               # DW_AT_name
	.int8	14                              # DW_FORM_strp
	.int8	60                              # DW_AT_declaration
	.int8	25                              # DW_FORM_flag_present
	.int8	0                               # EOM(1)
	.int8	0                               # EOM(2)
	.int8	0                               # EOM(3)
	.section	.debug_info,"",@
.Lcu_begin0:
	.int32	.Ldebug_info_end0-.Ldebug_info_start0 # Length of Unit
.Ldebug_info_start0:
	.int16	4                               # DWARF version number
	.int32	.debug_abbrev0                  # Offset Into Abbrev. Section
	.int8	4                               # Address Size (in bytes)
	.int8	1                               # Abbrev [1] 0xb:0x66 DW_TAG_compile_unit
	.int32	.Linfo_string0                  # DW_AT_producer
	.int16	29                              # DW_AT_language
	.int32	.Linfo_string1                  # DW_AT_name
	.int32	.Lline_table_start0             # DW_AT_stmt_list
	.int32	.Linfo_string2                  # DW_AT_comp_dir
	.int32	.Lfunc_begin0                   # DW_AT_low_pc
	.int32	.Lfunc_end0-.Lfunc_begin0       # DW_AT_high_pc
	.int8	2                               # Abbrev [2] 0x26:0x3c DW_TAG_subprogram
	.int32	.Lfunc_begin0                   # DW_AT_low_pc
	.int32	.Lfunc_end0-.Lfunc_begin0       # DW_AT_high_pc
	.int8	7                               # DW_AT_frame_base
	.int8	237
	.int8	3
	.int32	__stack_pointer
	.int8	159
	.int32	.Linfo_string3                  # DW_AT_name
	.int8	1                               # DW_AT_decl_file
	.int8	2                               # DW_AT_decl_line
                                        # DW_AT_prototyped
	.int32	98                              # DW_AT_type
                                        # DW_AT_external
	.int8	3                               # Abbrev [3] 0x41:0x10 DW_TAG_formal_parameter
	.int8	4                               # DW_AT_location
	.int8	237
	.int8	0
	.int8	0
	.int8	159
	.int32	.Linfo_string6                  # DW_AT_name
	.int8	1                               # DW_AT_decl_file
	.int8	2                               # DW_AT_decl_line
	.int32	98                              # DW_AT_type
	.int8	3                               # Abbrev [3] 0x51:0x10 DW_TAG_formal_parameter
	.int8	4                               # DW_AT_location
	.int8	237
	.int8	0
	.int8	1
	.int8	159
	.int32	.Linfo_string7                  # DW_AT_name
	.int8	1                               # DW_AT_decl_file
	.int8	2                               # DW_AT_decl_line
	.int32	98                              # DW_AT_type
	.int8	0                               # End Of Children Mark
	.int8	4                               # Abbrev [4] 0x62:0x9 DW_TAG_typedef
	.int32	107                             # DW_AT_type
	.int32	.Linfo_string5                  # DW_AT_name
	.int8	5                               # Abbrev [5] 0x6b:0x5 DW_TAG_structure_type
	.int32	.Linfo_string4                  # DW_AT_name
                                        # DW_AT_declaration
	.int8	0                               # End Of Children Mark
.Ldebug_info_end0:
	.section	.debug_str,"S",@
.Linfo_string0:
	.asciz	"Ubuntu clang version 17.0.6 (++20240124120726+6009708b4367-1~exp1~20240124120743.47)" # string offset=0
.Linfo_string1:
	.asciz	"externref.c"                   # string offset=85
.Linfo_string2:
	.asciz	"/home/jerome/sources/devtools-frontend/devtools-frontend/extensions/cxx_debugging/tests/inputs" # string offset=97
.Linfo_string3:
	.asciz	"f"                             # string offset=192
.Linfo_string4:
	.asciz	"externref_t"                   # string offset=194
.Linfo_string5:
	.asciz	"__externref_t"                 # string offset=206
.Linfo_string6:
	.asciz	"x"                             # string offset=220
.Linfo_string7:
	.asciz	"y"                             # string offset=222
	.ident	"Ubuntu clang version 17.0.6 (++20240124120726+6009708b4367-1~exp1~20240124120743.47)"
	.no_dead_strip	__indirect_function_table
	.section	.custom_section.producers,"",@
	.int8	2
	.int8	8
	.ascii	"language"
	.int8	1
	.int8	3
	.ascii	"C11"
	.int8	0
	.int8	12
	.ascii	"processed-by"
	.int8	1
	.int8	12
	.ascii	"Ubuntu clang"
	.int8	63
	.ascii	"17.0.6 (++20240124120726+6009708b4367-1~exp1~20240124120743.47)"
	.section	.debug_str,"S",@
	.section	.custom_section.target_features,"",@
	.int8	3
	.int8	43
	.int8	15
	.ascii	"mutable-globals"
	.int8	43
	.int8	15
	.ascii	"reference-types"
	.int8	43
	.int8	8
	.ascii	"sign-ext"
	.section	.debug_str,"S",@
	.section	.debug_line,"",@
.Lline_table_start0:
